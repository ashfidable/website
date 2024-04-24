import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

import svelte from '@astrojs/svelte'

// https://astro.build/config
import mdx from '@astrojs/mdx'

// Plugins for MDX
import expressiveCode from 'astro-expressive-code'
import sectionize from 'remark-sectionize'

// astro-icon integration
import icon from 'astro-icon'

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
	markdown: {
		remarkPlugins: [sectionize]
	},
	integrations: [
		icon(),
		tailwind(),
		svelte(),
		expressiveCode({
			themes: ['github-dark', 'aurora-x', 'rose-pine', 'rose-pine-dawn'],
			themeCssSelector: (theme) => `[data-code-theme="${theme.name}"]`
		}),
		mdx()
	],
	trailingSlash: 'never'
})
