import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const postsRoot = resolve(root, "src/content/posts");
const manifestPath = resolve(root, "public/link-previews.json");
const imagesRoot = resolve(root, "public/images/link-previews");
const imagesPath = "/images/link-previews";

const concurrency = 8;
const timeout = 10_000;
const maxImageBytes = 8 * 1024 * 1024;
const refresh = process.argv.includes("--refresh");

const config = JSON.parse(await readFile(resolve(root, "site.config.json"), "utf8"));
const siteHost = new URL(config.site.url).host;

const linkPattern =
  /(?<!!\[[^\]]*)\]\(\s*(https?:\/\/(?:[^\s()]|\([^\s()]*\))+)|\bhref=["'](https?:\/\/[^"']+)/g;

function previewKey(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.href;
}

async function collectLinks() {
  const links = new Set();
  for (const file of await readdir(postsRoot, { recursive: true })) {
    if (!file.endsWith(".mdx")) continue;
    const source = await readFile(join(postsRoot, file), "utf8");
    const prose = source.replace(/^(`{3,}|~{3,})[\s\S]*?^\1\s*$/gm, "");
    for (const match of prose.matchAll(linkPattern)) {
      const key = previewKey(match[1] ?? match[2]);
      if (new URL(key).host !== siteHost) links.add(key);
    }
  }
  return [...links].sort((a, b) => a.localeCompare(b));
}

function request(url) {
  return fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeout),
    headers: {
      accept: "text/html,application/xhtml+xml,image/*;q=0.8,*/*;q=0.5",
      "user-agent": `Mozilla/5.0 (compatible; ${siteHost} link preview)`,
    },
  });
}

function decodeEntities(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return text.replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (entity, decimal, hex, name) => {
    if (decimal) return String.fromCodePoint(Number(decimal));
    if (hex) return String.fromCodePoint(Number.parseInt(hex, 16));
    return named[name.toLowerCase()] ?? entity;
  });
}

function clean(text, limit) {
  const value = decodeEntities(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value || undefined;
}

function parseMetadata(html) {
  const head = html.split(/<\/head>/i)[0];
  const meta = new Map();
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((match) => [
        match[1].toLowerCase(),
        match[2] ?? match[3],
      ]),
    );
    const name = (attributes.property ?? attributes.name)?.toLowerCase();
    if (name && attributes.content && !meta.has(name)) meta.set(name, attributes.content);
  }
  return {
    title: clean(
      meta.get("og:title") ??
        meta.get("twitter:title") ??
        /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1],
      120,
    ),
    description: clean(
      meta.get("og:description") ?? meta.get("twitter:description") ?? meta.get("description"),
      200,
    ),
    image: meta.get("og:image") ?? meta.get("og:image:url") ?? meta.get("twitter:image"),
  };
}

/** Saves under a content hash, so identical images dedupe and can be cached forever. */
async function saveImage(url, resize) {
  try {
    const response = await request(url);
    if (!response.ok) return undefined;
    const source = Buffer.from(await response.arrayBuffer());
    if (source.length > maxImageBytes) return undefined;
    const output = await resize(sharp(source)).webp({ quality: 70 }).toBuffer();
    const name = `${createHash("sha256").update(output).digest("hex").slice(0, 16)}.webp`;
    await writeFile(join(imagesRoot, name), output);
    return `${imagesPath}/${name}`;
  } catch {
    return undefined;
  }
}

const favicons = new Map();

/** One lookup per host, shared by every link to that site. */
function saveFavicon(host) {
  if (!favicons.has(host)) {
    favicons.set(
      host,
      saveImage(`https://www.google.com/s2/favicons?domain=${host}&sz=64`, (image) =>
        image.resize(32, 32),
      ),
    );
  }
  return favicons.get(host);
}

async function fetchPreview(url) {
  const favicon = await saveFavicon(new URL(url).host);
  try {
    const response = await request(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!response.headers.get("content-type")?.includes("html")) throw new Error("not HTML");
    const { title, description, image } = parseMetadata(await response.text());
    if (!title) throw new Error("no title");
    const saved =
      image &&
      URL.canParse(image, response.url) &&
      (await saveImage(new URL(image, response.url).href, (source) =>
        source.resize(640, 335, { fit: "cover", withoutEnlargement: true }),
      ));
    return { title, description, image: saved || undefined, favicon };
  } catch (error) {
    console.warn(`link preview skipped: ${url} (${error.message ?? error})`);
    return { favicon };
  }
}

async function prune(manifest) {
  const used = new Set(
    Object.values(manifest).flatMap(({ image, favicon }) =>
      [image, favicon].filter(Boolean).map((path) => path.split("/").pop()),
    ),
  );
  for (const file of await readdir(imagesRoot)) {
    if (!used.has(file)) await rm(join(imagesRoot, file));
  }
}

await mkdir(imagesRoot, { recursive: true });
const previous = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));
for (const [url, { favicon }] of Object.entries(previous)) {
  if (favicon) favicons.set(new URL(url).host, Promise.resolve(favicon));
}

const links = await collectLinks();
// An entry without a title failed last time, so it gets another try on every run.
const pending = links.filter((url) => refresh || !previous[url]?.title);
const fetched = new Map();
let next = 0;

await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (next < pending.length) {
      const url = pending[next++];
      fetched.set(url, await fetchPreview(url));
    }
  }),
);

const manifest = {};
for (const url of links) {
  const fresh = fetched.get(url);
  manifest[url] = fresh?.title ? fresh : (previous[url] ?? fresh);
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await prune(manifest);

const complete = Object.values(manifest).filter((entry) => entry?.title).length;
console.log(`Link previews: ${complete}/${links.length} ready, ${pending.length} fetched`);
