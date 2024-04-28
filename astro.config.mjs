import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import svelte from '@astrojs/svelte';

import mdx from '@astrojs/mdx';

// Plugins for MDX
import expressiveCode from 'astro-expressive-code';
import sectionize from 'remark-sectionize';

// astro-icon integration
import icon from 'astro-icon';

// https://astro.build/config
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://ashfid.dev',
  markdown: {
    remarkPlugins: [sectionize]
  },
  integrations: [icon(), tailwind(), svelte(), expressiveCode(), mdx(), sitemap()],
  trailingSlash: 'never'
});