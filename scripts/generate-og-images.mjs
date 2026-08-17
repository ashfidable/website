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
  const cleanTitle = title.replace(/\p{Extended_Pictographic}|\uFE0F/gu, "").trim();

  return element(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#05050a",
        color: "#f4f1fa",
        fontFamily: "Manrope",
      },
    },
    element(
      "div",
      {
        style: {
          position: "absolute",
          left: 30,
          top: 30,
          width: 1140,
          height: 570,
          overflow: "hidden",
          border: "2px solid #292532",
          borderRadius: 24,
          backgroundColor: "#0b0a0f",
        },
      },
      element(
        "div",
        {
          style: {
            position: "absolute",
            left: 42,
            top: 34,
            alignItems: "center",
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: "0.06em",
          },
        },
        element("span", { style: { color: "#3de3f5" } }, "ASHFID"),
        element("span", { style: { color: "#1798d0" } }, "."),
      ),
      element(
        "div",
        {
          style: {
            position: "absolute",
            left: 42,
            top: 124,
            width: 660,
            flexDirection: "column",
          },
        },
        element(
          "div",
          {
            style: {
              color: "#3de3f5",
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            },
          },
          label,
        ),
        element(
          "div",
          {
            style: {
              marginTop: 17,
              maxHeight: 205,
              overflow: "hidden",
              color: "#f7f4ff",
              fontSize: 57,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.045em",
            },
          },
          cleanTitle,
        ),
        element(
          "div",
          {
            style: {
              marginTop: 25,
              maxHeight: 112,
              overflow: "hidden",
              color: "#c4bfce",
              fontSize: 24,
              lineHeight: 1.42,
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
            right: 38,
            top: 38,
            width: 360,
            height: 494,
            padding: 7,
            overflow: "hidden",
            borderRadius: 22,
            backgroundImage: "linear-gradient(145deg, #3de3f5 0%, #1798d0 100%)",
          },
        },
        element("img", {
          src: artwork,
          alt: artworkAlt ?? "",
          width: 346,
          height: 480,
          style: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 16,
          },
        }),
      ),
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
