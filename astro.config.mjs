import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

import svelte from '@astrojs/svelte'

// https://astro.build/config
import mdx from '@astrojs/mdx'

// plugins for markdown / mdx
import sectionize from 'remark-sectionize'

// astro-icon integration
import icon from 'astro-icon'

// https://astro.build/config
import expressiveCode from 'astro-expressive-code'

// https://astro.build/config
export default defineConfig({
	markdown: {
		remarkPlugins: []
	},
	integrations: [
		icon(),
		tailwind(),
		svelte(),
		expressiveCode({
			themes: ['dracula', 'aurora-x', 'rose-pine']
		}),
		mdx()
	],
	trailingSlash: 'never'
})
