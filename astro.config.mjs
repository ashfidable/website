import { defineConfig } from 'astro/config'

import tailwind from '@astrojs/tailwind'

// https://astro.build/config
import svelte from '@astrojs/svelte'

// https://astro.build/config
import mdx from '@astrojs/mdx'

// plugins for markdown / mdx
import sectionize from 'remark-sectionize'

// astro-icon integration
import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
	markdown: {
		remarkPlugins: [sectionize]
	},
	integrations: [icon(), tailwind(), svelte(), mdx()],
	trailingSlash: 'never'
})
