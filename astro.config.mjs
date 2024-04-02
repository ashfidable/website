import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

import svelte from '@astrojs/svelte'

// https://astro.build/config
import mdx from '@astrojs/mdx'

// Plugins for MDX
import expressiveCode from 'astro-expressive-code'

// astro-icon integration
import icon from 'astro-icon'

// https://astro.build/config

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
			themes: ['github-dark', 'aurora-x', 'rose-pine']
		}),
		mdx({
			optimize: true
		})
	],
	trailingSlash: 'never'
})
