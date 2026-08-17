import { Resvg } from "@resvg/resvg-js";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { extname, relative, resolve, dirname } from "node:path";
import satori from "satori";
import { parse } from "yaml";

const root = resolve(import.meta.dirname, "..");
const postsRoot = resolve(root, "src/content/posts");
const outputRoot = resolve(root, "public/images/og");
const width = 1200;
const height = 630;

const config = JSON.parse(await readFile(resolve(root, "site.config.json"), "utf8"));
const categories = new Map(config.categories.map((category) => [category.id, category.name]));
const bodyFont = await readFile(
  resolve(root, "node_modules/typeface-manrope/manrope/manrope-regular.woff"),
);
const bodyBoldFont = await readFile(
  resolve(root, "node_modules/typeface-manrope/manrope/manrope-semibold.woff"),
);
const headingFont = await readFile(
  resolve(root, "node_modules/typeface-manrope/manrope/manrope-extrabold.woff"),
);

function element(type, props, ...children) {
  const style = type === "div" ? { display: "flex", ...props?.style } : props?.style;
  return { type, props: { ...props, style, children: children.flat() } };
}

function imageDataUrl(path) {
  return readFile(path).then((data) => {
    const mimeTypes = {
      ".jpeg": "image/jpeg",
      ".jpg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };
    const mime = mimeTypes[extname(path).toLowerCase()];
    if (!mime) throw new Error(`Unsupported social image type: ${path}`);
    return `data:${mime};base64,${data.toString("base64")}`;
  });
}

function card({ title, description, label, artwork, artworkAlt }) {
  const cleanTitle = title
    .replace(/\p{Extended_Pictographic}|\uFE0F/gu, "")
    .trim()
    .toUpperCase();

  return element(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#0b0a0f",
        color: "#f4f1fa",
        fontFamily: "Manrope",
      },
    },
    element("div", {
      style: {
        position: "absolute",
        left: 28,
        top: 28,
        width: 1144,
        height: 574,
        border: "4px solid #3de3f5",
      },
    }),
    element("div", {
      style: {
        position: "absolute",
        left: 28,
        right: 28,
        top: 28,
        height: 66,
        backgroundColor: "#3de3f5",
      },
    }),
    element(
      "div",
      {
        style: {
          position: "absolute",
          left: 54,
          top: 49,
          alignItems: "center",
          color: "#0b0a0f",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "0.08em",
        },
      },
      "ASHFID.DEV",
    ),
    element(
      "div",
      {
        style: {
          position: "absolute",
          right: 54,
          top: 51,
          color: "#0b0a0f",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        },
      },
      label,
    ),
    element(
      "div",
      {
        style: {
          position: "absolute",
          left: 54,
          top: 132,
          width: 660,
          flexDirection: "column",
        },
      },
      element(
        "div",
        {
          style: {
            maxHeight: 230,
            overflow: "hidden",
            color: "#f7f4ff",
            fontFamily: "Manrope",
            fontSize: 54,
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: "-0.055em",
          },
        },
        cleanTitle,
      ),
      element(
        "div",
        {
          style: {
            marginTop: 30,
            maxHeight: 112,
            overflow: "hidden",
            color: "#b9b4c4",
            fontSize: 24,
            lineHeight: 1.38,
          },
        },
        description,
      ),
    ),
    element(
      "div",
      {
        style: {
          position: "absolute",
          left: 54,
          bottom: 48,
          padding: "12px 18px",
          backgroundColor: "#3de3f5",
          color: "#0b0a0f",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.08em",
        },
      },
      "READ AT ASHFID.DEV",
    ),
    element("div", {
      style: {
        position: "absolute",
        right: 50,
        top: 139,
        width: 362,
        height: 410,
        backgroundColor: "#3de3f5",
      },
    }),
    element(
      "div",
      {
        style: {
          position: "absolute",
          right: 66,
          top: 123,
          width: 362,
          height: 410,
          overflow: "hidden",
          border: "4px solid #3de3f5",
          backgroundColor: "#0b0a0f",
        },
      },
      element("img", {
        src: artwork,
        alt: artworkAlt ?? "",
        width: 362,
        height: 410,
        style: { width: "100%", height: "100%", objectFit: "cover" },
      }),
    ),
  );
}

async function renderCard(details, outputPath) {
  const svg = await satori(card(details), {
    width,
    height,
    fonts: [
      { name: "Manrope", data: bodyFont, weight: 400, style: "normal" },
      { name: "Manrope", data: bodyBoldFont, weight: 600, style: "normal" },
      { name: "Manrope", data: headingFont, weight: 800, style: "normal" },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, png);
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

const defaultArtwork = await imageDataUrl(resolve(root, "public/images/android-chrome-512x512.png"));
await renderCard(
  {
    title: config.site.title,
    description: config.site.description,
    label: "Digital garden",
    artwork: defaultArtwork,
    artworkAlt: "Ashfid avatar",
  },
  resolve(outputRoot, "default.png"),
);

const postFiles = (await walk(postsRoot)).filter((path) => path.endsWith(".mdx"));
for (const path of postFiles) {
  const metadata = readFrontmatter(await readFile(path, "utf8"), path);
  const postId = relative(postsRoot, path).replaceAll("\\", "/").replace(/\.mdx$/, "");
  const artwork = metadata.social_image
    ? await imageDataUrl(resolve(root, metadata.social_image))
    : defaultArtwork;

  await renderCard(
    {
      title: metadata.title,
      description: metadata.description,
      label: categories.get(metadata.category) ?? metadata.category,
      artwork,
      artworkAlt: metadata.social_image_alt ?? "Ashfid avatar",
    },
    resolve(outputRoot, `${postId}.png`),
  );
}

console.log(`Generated ${postFiles.length + 1} Open Graph images in public/images/og.`);
