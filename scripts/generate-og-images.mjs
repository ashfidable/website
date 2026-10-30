import { createHash } from "node:crypto";
import { readFile, readdir, mkdir, writeFile, rename } from "node:fs/promises";
import { relative, resolve, dirname } from "node:path";
import { parse } from "yaml";

const started = performance.now();
const root = resolve(import.meta.dirname, "..");
const postsRoot = resolve(root, "src/content/posts");
const outputRoot = resolve(root, "public/images/og");
const cachePath = resolve(root, ".cache/og/manifest.json");
const width = 1200;
const height = 630;

const [configSource, monoFont, template, lockfile] = await Promise.all([
  readFile(resolve(root, "site.config.json"), "utf8"),
  readFile(resolve(root, "scripts/fonts/JetBrainsMono-Regular.ttf")),
  readFile(import.meta.filename),
  readFile(resolve(root, "pnpm-lock.yaml")),
]);
const config = JSON.parse(configSource);
const categories = new Map(config.categories.map((category) => [category.id, category.name]));
// Font, renderer dependencies, template and branding changes invalidate cached cards.
const rendererKey = hash(
  template,
  monoFont,
  lockfile,
  JSON.stringify({
    terminal: config.terminal,
    host: new URL(config.site.url).host,
  }),
);
const colors = {
  background: "#0b0a0f",
  window: "#171421",
  bar: "#221e30",
  border: "#36303f",
  text: "#d5d0e1",
  muted: "#aaa7b2",
  accent: "#0eb2cc",
};

function element(type, props, ...children) {
  const style = type === "div" ? { display: "flex", ...props?.style } : props?.style;
  return { type, props: { ...props, style, children: children.flat() } };
}

function card({ title, description, label, postId }) {
  const cleanTitle = title.replace(/\p{Extended_Pictographic}|\uFE0F/gu, "").trim();
  const folder = postId ? `~/${postId.split("/")[0]}` : "~";
  const command = postId ? `cat ${postId.split("/").at(-1)}.mdx` : "whoami";

  return element(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        padding: 32,
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: "JetBrains Mono",
      },
    },
    element(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          flexDirection: "column",
          overflow: "hidden",
          border: `2px solid ${colors.border}`,
          borderRadius: 12,
          backgroundColor: colors.window,
        },
      },
      element(
        "div",
        {
          style: {
            height: 64,
            flexShrink: 0,
            alignItems: "center",
            padding: "0 26px",
            backgroundColor: colors.bar,
            borderBottom: `1px solid ${colors.border}`,
          },
        },
        element(
          "div",
          { style: { gap: 10 } },
          ...["#f87171", "#facc15", "#4ade80"].map((color) =>
            element("div", {
              style: { width: 12, height: 12, borderRadius: 6, backgroundColor: color },
            }),
          ),
        ),
        element(
          "div",
          { style: { marginLeft: 24, fontSize: 20, color: colors.muted } },
          `${config.terminal.user}@${config.terminal.host}: ${folder}`,
        ),
      ),
      element(
        "div",
        {
          style: { flexDirection: "column", flex: 1, padding: "36px 42px" },
        },
        element(
          "div",
          { style: { fontSize: 22, color: colors.muted } },
          element("span", { style: { color: colors.accent, marginRight: 14 } }, "%"),
          command,
        ),
        element(
          "div",
          {
            style: {
              marginTop: 28,
              fontSize: cleanTitle.length > 42 ? 46 : 54,
              lineHeight: 1.18,
              letterSpacing: "-0.035em",
              color: colors.accent,
            },
          },
          cleanTitle,
        ),
        element(
          "div",
          {
            style: { marginTop: 22, fontSize: 24, lineHeight: 1.45, color: colors.text },
          },
          description,
        ),
      ),
      element(
        "div",
        {
          style: {
            height: 48,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 26px",
            fontSize: 18,
            color: colors.muted,
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.bar,
          },
        },
        element("span", {}, label.toLowerCase()),
        element("span", { style: { color: colors.accent } }, new URL(config.site.url).host),
      ),
    ),
  );
}

async function renderCard(details, satori, renderAsync) {
  const svg = await satori(card(details), {
    width,
    height,
    fonts: [{ name: "JetBrains Mono", data: monoFont, weight: 400, style: "normal" }],
  });
  // Satori embeds glyphs as paths; scanning the machine's fonts adds no value.
  const image = await renderAsync(svg, {
    font: { loadSystemFonts: false },
    fitTo: { mode: "width", value: width },
  });
  return image.asPng();
}

function hash(...values) {
  const digest = createHash("sha256");
  for (const value of values) digest.update(value);
  return digest.digest("hex");
}

async function readOptional(path) {
  try {
    return await readFile(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function writeAtomic(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, contents);
  await rename(temporary, path);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? walk(path) : path;
    }),
  );
  return files.flat();
}

function readFrontmatter(source, path) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`Missing frontmatter in ${path}`);
  return parse(match[1]);
}

const cards = [
  {
    id: "default.png",
    details: {
      title: config.site.title,
      description: config.site.description,
      label: "Digital garden",
    },
  },
];

const postFiles = (await walk(postsRoot)).filter((path) => path.endsWith(".mdx"));
cards.push(
  ...(await Promise.all(
    postFiles.map(async (path) => {
      const metadata = readFrontmatter(await readFile(path, "utf8"), path);
      const postId = relative(postsRoot, path)
        .replaceAll("\\", "/")
        .replace(/\.mdx$/, "");

      return {
        id: `${postId}.png`,
        details: {
          title: metadata.title,
          description: metadata.description,
          label: categories.get(metadata.category) ?? metadata.category,
          postId,
        },
      };
    }),
  )),
);

let previous = {};
const cached = await readOptional(cachePath);
if (cached) {
  try {
    previous = JSON.parse(cached);
  } catch {
    // A broken cache must never prevent a clean regeneration.
  }
}
const manifest = {};
const pending = [];
await Promise.all(
  cards.map(async (card) => {
    const input = hash(rendererKey, JSON.stringify(card.details));
    const outputPath = resolve(outputRoot, card.id);
    const entry = previous?.[card.id];
    const output = entry?.input === input ? await readOptional(outputPath) : null;
    if (output && hash(output) === entry.output) {
      manifest[card.id] = entry;
    } else {
      pending.push({ ...card, input, outputPath });
    }
  }),
);

if (pending.length) {
  // Cached builds don't even initialize the layout engine or native renderer.
  const [{ default: satori }, { renderAsync }] = await Promise.all([
    import("satori"),
    import("@resvg/resvg-js"),
  ]);
  // Bound native raster jobs instead of creating a worker per article.
  for (let index = 0; index < pending.length; index += 4) {
    await Promise.all(
      pending.slice(index, index + 4).map(async (card) => {
        const png = await renderCard(card.details, satori, renderAsync);
        await writeAtomic(card.outputPath, png);
        manifest[card.id] = { input: card.input, output: hash(png) };
      }),
    );
  }
  await writeAtomic(cachePath, JSON.stringify(manifest));
}

console.log(
  `Open Graph: rendered ${pending.length}, reused ${cards.length - pending.length} (${Math.round(performance.now() - started)}ms).`,
);
