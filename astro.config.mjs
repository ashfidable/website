import { defineConfig } from 'astro/config'

import tailwind from '@astrojs/tailwind'

// https://astro.build/config
import svelte from '@astrojs/svelte'

// https://astro.build/config
import mdx from '@astrojs/mdx'

// plugins for markdown / mdx
import sectionize from 'remark-sectionize'

// https://astro.build/config
export default defineConfig({
	markdown: {
		remarkPlugins: [sectionize]
	},
	integrations: [tailwind(), svelte(), mdx()],
	trailingSlash: 'never'
})
