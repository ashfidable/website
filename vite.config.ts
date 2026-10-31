import { configSchema, postSchema } from "./src/content/schema";
import { extractHeadings } from "./src/content/headings";
import { getReadingTime } from "./src/utils/reading-time";
import { parse as parseYaml } from "yaml";
import mdx from "@mdx-js/rollup";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { redact } from "@tanstack/redact/vite";
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

/** Light entries from themeNames in settings-provider.tsx; every other theme is dark. */
const lightThemes = ["light", "ocean", "rose", "mint", "lavender", "peach", "meadow", "sand"];

/** Fills a fenced block from disk, so posts can highlight source files: ```glsl file="src/a.glsl" */
function remarkCodeFile() {
  return (tree: any) => {
    const visit = (node: any) => {
      const file = node.type === "code" && /\bfile="([^"]+)"/.exec(node.meta ?? "");
      if (file) {
        const path = fileURLToPath(new URL(`./${file[1]}`, import.meta.url));
        node.value = readFileSync(path, "utf8").trimEnd();
        node.meta = node.meta.replace(file[0], "").trim();
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

function siteIcons(): Plugin {
  const virtualId = "\0virtual:site-icons";
  const configPath = fileURLToPath(new URL("./site.config.json", import.meta.url));
  const references = new Set<string>();
  const devSprites = new Map<string, string>();
  let serving = false;
  return {
    name: "site-icons",
    configureServer(server) {
      serving = true;
      server.middlewares.use((request, response, next) => {
        const svg = devSprites.get(request.url ?? "");
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
      const configSource = readFileSync(configPath, "utf8");
      const config = configSchema.parse(JSON.parse(configSource));
      const stackIcons = new Set(
        config.skills.flatMap((skill) => skill.entries.map((entry) => entry.icon)),
      );
      const toolIcons = new Set(config.tools.map((tool) => tool.icon));
      const sources = [configSource];
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
      const groups = new Map<
        string,
        { symbols: string[]; icons: Record<string, { id: string; width: number; height: number }> }
      >();
      const entries: string[] = [];
      const assetUrl = (name: string, source: string) => {
        if (serving) {
          const path = `/__site-icons/${name}`;
          devSprites.set(path, source);
          return JSON.stringify(path);
        }
        const reference = this.emitFile({ type: "asset", name, source });
        references.add(reference);
        return `import.meta.ROLLUP_FILE_URL_${reference}`;
      };
      for (const name of matches) {
        const [prefix, iconName] = name.split(":");
        const collection = iconCollections[prefix as keyof typeof iconCollections];
        const icon = collection?.icons[iconName];
        if (!icon) continue;
        // Share artwork without making the homepage download tool-only icons.
        const groupName = stackIcons.has(name) ? "stack" : toolIcons.has(name) ? "tools" : "ui";
        let group = groups.get(groupName);
        if (!group) groups.set(groupName, (group = { symbols: [], icons: {} }));
        const width = icon.width ?? collection.width ?? 24;
        const height = icon.height ?? collection.height ?? 24;
        const symbolId = `${prefix}-${iconName}`;
        // WebKit drops paint servers in external <use> trees. Render complex brand
        // artwork as a regular SVG image; keep simple icons in the shared sprites.
        if (/<(?:linearGradient|radialGradient|filter|mask)\b/.test(icon.body)) {
          const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${icon.body}</svg>`;
          const url = assetUrl(`${symbolId}.svg`, source);
          entries.push(
            `${JSON.stringify(name)}:{width:${width},height:${height},url:${url},image:true}`,
          );
          continue;
        }
        // Definitions from different icons must not collide within a shared SVG.
        const body = icon.body
          .replace(/\bid="([^"]+)"/g, `id="${symbolId}-$1"`)
          .replace(/url\(#([^)]+)\)/g, `url(#${symbolId}-$1)`)
          .replace(/href="#([^"]+)"/g, `href="#${symbolId}-$1"`);
        group.symbols.push(
          `<symbol id="${symbolId}" viewBox="0 0 ${width} ${height}">${body}</symbol>`,
        );
        group.icons[name] = { id: symbolId, width, height };
      }
      for (const [name, group] of groups) {
        const source = `<svg xmlns="http://www.w3.org/2000/svg">${group.symbols.join("")}</svg>`;
        if (Object.keys(group.icons).length === 0) continue;
        const url = assetUrl(`icons-${name}.svg`, source);
        for (const [name, icon] of Object.entries(group.icons)) {
          entries.push(
            `${JSON.stringify(name)}:{width:${icon.width},height:${icon.height},url:${url}+${JSON.stringify(`#${icon.id}`)}}`,
          );
        }
      }
      return `export default {${entries.join(",")}}`;
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
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts", "worker-configuration.d.ts", "migrations/meta/**"],
  },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts", "worker-configuration.d.ts"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: {
    tsconfigPaths: true,
  },
  ssr: { noExternal: true },
  environments: {
    client: {
      build: {
        rolldownOptions: {
          output: {
            codeSplitting: {
              groups: [
                {
                  name: "framework",
                  test: /node_modules[\\/]@tanstack[\\/]redact[\\/]/,
                  includeDependenciesRecursively: false,
                },
              ],
            },
          },
        },
      },
    },
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

        return new URLSearchParams({ format: "webp", quality: "78", effort: "4" });
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
        // Linked gallery images are already built assets, not pages to render.
        filter: ({ path }) => !path.startsWith("/assets/"),
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
        if (!id.startsWith("\0") || !id.endsWith(".mdx.metadata.js")) return null;
        const path = id.slice(1, -".metadata.js".length);
        this.addWatchFile(path);
        const source = readFileSync(path, "utf8");
        const frontmatter = parseYaml(/^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? "");
        return `export default ${JSON.stringify({ frontmatter: postSchema.parse(frontmatter), readingTime: getReadingTime(source), headings: extractHeadings(source) })}`;
      },
    },
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
        remarkCodeFile,
      ],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeExpressiveCode,
          {
            themes: ["rose-pine", "rose-pine-dawn"],
            useThemedScrollbars: false,
            // Follow the site's theme picker rather than the OS, and drop the terminal frame:
            // these blocks already sit inside one.
            useDarkModeMediaQuery: false,
            themeCssSelector: (theme: { type: string }) =>
              theme.type === "light" &&
              `:root:is(${lightThemes.map((name) => `[data-theme="${name}"]`).join(",")})`,
            defaultProps: { frame: "code", wrap: true },
            styleOverrides: {
              borderRadius: "var(--rounded-radius)",
              borderWidth: "1px",
              borderColor: "var(--color-border-highlight)",
              codeBackground: "var(--color-card-background)",
              codeFontFamily: "var(--font-mono)",
              codeFontSize: "0.875rem",
              codeLineHeight: "1.625",
              codePaddingBlock: "0.75rem",
              codePaddingInline: "1rem",
              uiFontFamily: "var(--font-mono)",
              uiFontSize: "0.75rem",
              uiPaddingBlock: "0.25rem",
              uiPaddingInline: "1rem",
              scrollbarThumbColor: "var(--color-heading-text)",
              scrollbarThumbHoverColor: "var(--color-heading-text-hover)",
              frames: {
                frameBoxShadowCssValue: "none",
                editorTabBarBackground: "transparent",
                editorTabBarBorderBottomColor: "var(--color-border-highlight)",
                editorActiveTabBackground: "transparent",
                editorActiveTabForeground: "var(--color-body-text-low-contrast)",
                editorActiveTabIndicatorTopColor: "transparent",
                editorActiveTabIndicatorBottomColor: "transparent",
                inlineButtonForeground: "var(--color-body-text-low-contrast)",
              },
            },
          },
        ],
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
    redact(),
    tailwindcss(),
  ]),
});
