import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import rehypeExpressiveCode from 'rehype-expressive-code'
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { icons as devicon } from '@iconify-json/devicon-plain'
import { icons as fileIcons } from '@iconify-json/file-icons'
import { icons as logos } from '@iconify-json/logos'
import { icons as mdi } from '@iconify-json/mdi'
import { icons as ri } from '@iconify-json/ri'
import { icons as simpleIcons } from '@iconify-json/simple-icons'
import { icons as svgSpinners } from '@iconify-json/svg-spinners'

const iconCollections = {
  'devicon-plain': devicon,
  'file-icons': fileIcons,
  logos,
  mdi,
  ri,
  'simple-icons': simpleIcons,
  'svg-spinners': svgSpinners,
}

function siteIcons() {
  const virtualId = '\0virtual:site-icons'
  return {
    name: 'site-icons',
    resolveId(id: string) {
      return id === 'virtual:site-icons' ? virtualId : null
    },
    load(id: string) {
      if (id !== virtualId) return null
      const sourceRoot = fileURLToPath(new URL('./src', import.meta.url))
      const matches = new Set<string>()
      for (const relative of readdirSync(sourceRoot, { recursive: true }) as string[]) {
        if (!/\.(tsx?|mdx|yaml)$/.test(relative)) continue
        const source = readFileSync(
          fileURLToPath(new URL(`./src/${relative.replace(/\\/g, '/')}`, import.meta.url)),
          'utf8',
        )
        for (const match of source.matchAll(
          /(?:devicon-plain|file-icons|logos|mdi|ri|simple-icons|svg-spinners):[a-zA-Z0-9-]+/g,
        )) {
          matches.add(match[0])
        }
      }
      const selected: Record<string, unknown> = {}
      for (const name of matches) {
        const [prefix, iconName] = name.split(':')
        const collection = iconCollections[prefix as keyof typeof iconCollections]
        const icon = collection?.icons[iconName]
        if (icon) {
          selected[name] = {
            ...icon,
            width: icon.width ?? collection.width,
            height: icon.height ?? collection.height,
          }
        }
      }
      return `export default ${JSON.stringify(selected)}`
    },
  }
}

export default defineConfig({
  plugins: [
    tsconfigPaths({ loose: true }),
    siteIcons(),
    tanstackStart({
      pages: [
        { path: '/api/posts.json', prerender: { enabled: true, outputPath: '/api/posts.json' } },
        { path: '/robots.txt', prerender: { enabled: true, outputPath: '/robots.txt' } },
        {
          path: '/sitemap-index.xml',
          prerender: { enabled: true, outputPath: '/sitemap-index.xml' },
        },
      ],
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
        failOnError: true,
      },
    }),
    {
      name: 'mdx-source-export',
      transform(code, id) {
        if (!id.endsWith('.mdx')) return null
        return `${code}\n\nexport const source = ${JSON.stringify(code)}`
      },
    },
    mdx({
      remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: 'frontmatter' }]],
      rehypePlugins: [rehypeSlug, [rehypeExpressiveCode, { themes: ['rose-pine', 'rose-pine-dawn'] }]],
    }),
    // MDX emits React runtime calls itself. Keeping .mdx out of the Babel pass
    // avoids the React plugin attempting to parse raw MDX during development.
    viteReact({ include: /\.(js|jsx|ts|tsx)$/ }),
    tailwindcss(),
  ],
})
