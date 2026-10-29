import { configSchema, postSchema } from "./src/content/schema";
import { parse as parseYaml } from "yaml";
import mdx from "@mdx-js/rollup";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import rehypeExpressiveCode from "rehype-expressive-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig, type Plugin, lazyPlugins } from "vite-plus";
import { imagetools } from "vite-imagetools";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { icons as devicon } from "@iconify-json/devicon-plain";
import { icons as fileIcons } from "@iconify-json/file-icons";
import { icons as logos } from "@iconify-json/logos";
import { icons as mdi } from "@iconify-json/mdi";
import { icons as ri } from "@iconify-json/ri";
import { icons as simpleIcons } from "@iconify-json/simple-icons";
import { icons as svgSpinners } from "@iconify-json/svg-spinners";

/** Brand marks missing from the Iconify sets (e.g. Craft), in Iconify JSON format. */
const customIcons = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./src/assets/icons/custom-icons.json", import.meta.url)),
    "utf8",
  ),
);

const iconCollections = {
  custom: customIcons,
  "devicon-plain": devicon,
  "file-icons": fileIcons,
  logos,
  mdi,
  ri,
  "simple-icons": simpleIcons,
  "svg-spinners": svgSpinners,
};

function siteIcons(): Plugin {
  const virtualId = "\0virtual:site-icons";
  const configPath = fileURLToPath(new URL("./site.config.json", import.meta.url));
  const references = new Set<string>();
  const devIcons = new Map<string, string>();
  let serving = false;
  return {
    name: "site-icons",
    configureServer(server) {
      serving = true;
      server.middlewares.use((request, response, next) => {
        const svg = devIcons.get(request.url ?? "");
        if (!svg) return next();
        response.setHeader("Content-Type", "image/svg+xml");
        response.end(svg);
      });
    },
    resolveFileUrl({ referenceId, fileName }) {
      return references.has(referenceId) ? JSON.stringify(`/${fileName}`) : undefined;
    },
    resolveId(id: string) {
      return id === "virtual:site-icons" ? virtualId : null;
    },
    load(id: string) {
      if (id !== virtualId) return null;
      const sourceRoot = fileURLToPath(new URL("./src", import.meta.url));
      const matches = new Set<string>();
      const sources = [readFileSync(configPath, "utf8")];
      for (const relative of readdirSync(sourceRoot, { recursive: true }) as string[]) {
        if (!/\.(tsx?|mdx)$/.test(relative)) continue;
        sources.push(
          readFileSync(
            fileURLToPath(new URL(`./src/${relative.replace(/\\/g, "/")}`, import.meta.url)),
            "utf8",
          ),
        );
      }
      for (const source of sources) {
        for (const match of source.matchAll(
          /(?:custom|devicon-plain|file-icons|logos|mdi|ri|simple-icons|svg-spinners):[a-zA-Z0-9-]+/g,
        )) {
          matches.add(match[0]);
        }
      }
      const selected: Record<string, unknown> = {};
      for (const name of matches) {
        const [prefix, iconName] = name.split(":");
        const collection = iconCollections[prefix as keyof typeof iconCollections];
        const icon = collection?.icons[iconName];
        if (icon) {
          const width = icon.width ?? collection.width ?? 24;
          const height = icon.height ?? collection.height ?? 24;
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><symbol id="icon" viewBox="0 0 ${width} ${height}">${icon.body}</symbol></svg>`;
          if (serving) {
            const url = `/__site-icons/${prefix}-${iconName}.svg`;
            devIcons.set(url, svg);
            selected[name] = { width, height, url };
          } else {
            const reference = this.emitFile({
              type: "asset",
              name: `${prefix}-${iconName}.svg`,
              source: svg,
            });
            references.add(reference);
            selected[name] = { width, height, reference };
          }
        }
      }
      return `export default {${Object.entries(selected)
        .map(([name, value]) => {
          const { width, height, reference, url } = value as {
            width: number;
            height: number;
            reference?: string;
            url?: string;
          };
          return `${JSON.stringify(name)}:{width:${width},height:${height},url:${url ? JSON.stringify(url) : `import.meta.ROLLUP_FILE_URL_${reference}`}}`;
        })
        .join(",")}}`;
    },
    handleHotUpdate({ file, server }) {
      if (file !== configPath) return;
      const iconModule = server.moduleGraph.getModuleById(virtualId);
      if (iconModule) server.moduleGraph.invalidateModule(iconModule);
      server.ws.send({ type: "full-reload" });
    },
  };
}

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: lazyPlugins(() => [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    imagetools({
      defaultDirectives: (url) => {
        if (
          url.searchParams.has("as") ||
          !url.pathname.replace(/\\/g, "/").includes("/src/assets/images/posts/")
        ) {
          return new URLSearchParams();
        }

        return new URLSearchParams({ format: "webp", quality: "78", effort: "max" });
      },
    }),
    siteIcons(),
    {
      name: "site-config",
      resolveId(id) {
        return id === "virtual:site-config" ? "\0virtual:site-config" : null;
      },
      load(id) {
        if (id !== "\0virtual:site-config") return null;
        const path = fileURLToPath(new URL("./site.config.json", import.meta.url));
        this.addWatchFile(path);
        return `export default ${JSON.stringify(configSchema.parse(JSON.parse(readFileSync(path, "utf8"))))}`;
      },
    },
    tanstackStart({
      client: { entry: "./client.tsx" },
      pages: [
        { path: "/rss.xml", prerender: { enabled: true, outputPath: "/rss.xml" } },
        { path: "/api/posts.json", prerender: { enabled: true, outputPath: "/api/posts.json" } },
        { path: "/robots.txt", prerender: { enabled: true, outputPath: "/robots.txt" } },
        {
          path: "/sitemap-index.xml",
          prerender: { enabled: true, outputPath: "/sitemap-index.xml" },
        },
      ],
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: false,
        failOnError: true,
      },
    }),
    {
      name: "mdx-metadata",
      enforce: "pre",
      async resolveId(source, importer) {
        if (!source.endsWith(".mdx?metadata")) return null;
        const resolved = await this.resolve(source.slice(0, -"?metadata".length), importer, {
          skipSelf: true,
        });
        return resolved ? `\0${resolved.id}.metadata.js` : null;
      },
      load(id) {
        if (!id.endsWith(".mdx.metadata.js")) return null;
        const path = id.replace(/^\0/, "").slice(0, -".metadata.js".length);
        this.addWatchFile(path);
        const source = readFileSync(path, "utf8");
        const frontmatter = parseYaml(/^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? "");
        return `export default ${JSON.stringify({ frontmatter: postSchema.parse(frontmatter), source })}`;
      },
    },
    {
      name: "mdx-source-export",
      transform(code, id) {
        if (!id.endsWith(".mdx")) return null;
        return `${code}\n\nexport const source = ${JSON.stringify(code)}`;
      },
    },
    mdx({
      remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: "frontmatter" }]],
      rehypePlugins: [
        rehypeSlug,
        [rehypeExpressiveCode, { themes: ["rose-pine", "rose-pine-dawn"] }],
        // Scrollable code regions need distinct names for landmark navigation.
        () => (tree: any) => {
          let codeBlock = 0;
          const visit = (node: any) => {
            if (node.tagName === "pre") {
              node.properties ??= {};
              // Expressive Code measures overflow and owns these attributes before hydration.
              node.properties.suppressHydrationWarning = true;
              node.properties.role = "region";
              node.properties.tabIndex = 0;
              node.properties.title = `Code block ${++codeBlock}, ${node.properties.dataLanguage ?? node.properties["data-language"] ?? "source"}`;
            }
            node.children?.forEach(visit);
          };
          visit(tree);
        },
      ],
    }),
    // MDX emits React runtime calls itself. Keeping .mdx out of the Babel pass
    // avoids the React plugin attempting to parse raw MDX during development.
    viteReact({ include: /\.(js|jsx|ts|tsx)$/ }),
    tailwindcss(),
  ]),
});
