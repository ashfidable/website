# ashfid.dev

Personal website built with TanStack Start, React, MDX, Tailwind CSS, and shadcn-style UI primitives.

Site metadata, navigation, categories, tools, skill groups, and icon mappings are maintained in
`site.config.json`. Long-form posts remain in `src/content/posts` as MDX.

```bash
pnpm install
pnpm dev
```

## Add a blog post

Create `src/content/posts/blog/my-post.mdx`. The filename becomes the URL, so this
example is published at `/blog/my-post`.

```mdx
---
title: My post title
description: A short summary used for search engines and link previews.
published_time: 2026-08-08
category: web
tags:
  - website
  - development
---

Write the post here using Markdown.

## A section heading

You can also import and use React components because post files use MDX.
```

`title`, `description`, `published_time`, `category`, and `tags` are required.
The category must match an ID in `site.config.json`. You can optionally add
`last_modified_time: YYYY-MM-DD`. Run `pnpm check` and `pnpm build` before
publishing to catch invalid frontmatter or MDX.

Useful commands:

- `pnpm check` — type-check the project
- `pnpm build` — clean old output, build every route, and verify the Cloudflare Pages bundle
- `pnpm preview` — preview the production build locally

## Cloudflare Pages

This site is fully prerendered. Configure the Pages project with:

- Framework preset: `None`
- Build command: `pnpm build`
- Build output directory: `dist/client`
- Root directory: `/`

Do not publish `dist`. TanStack Start places the deployable static site in `dist/client` and its
server bundle in `dist/server`. The build starts by deleting the entire `dist` folder and fails if
the static output contains an old `/_astro/` reference or a missing generated asset.

When migrating an existing Pages project from Astro, update the output directory, clear the Pages
build cache, and redeploy. If a custom Cloudflare Cache Rule caches HTML, purge that cache after the
first corrected deployment.
