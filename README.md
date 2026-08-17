# ashfid.dev

Personal website built with TanStack Start, React, MDX, Tailwind CSS, and shadcn-style UI primitives.

Site metadata, navigation, categories, tools, skill groups, and icon mappings are maintained in
`site.config.json`. Long-form posts remain in `src/content/posts` as MDX.

```bash
vp install
vp run dev
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
`last_modified_time: YYYY-MM-DD`. Run `vp run check` and `vp run build` before
publishing to catch invalid frontmatter or MDX.

Every page includes Open Graph and X/Twitter metadata. The build generates 1200×630 PNG share
cards with Satori into `public/images/og` before TanStack Start prerenders the site. Posts get an
individual card automatically. To feature an image already in the repository, add these optional
frontmatter fields (paths are relative to the repository root):

```yaml
social_image: src/assets/images/posts/my-post/cover.jpg
social_image_alt: A concise description of the cover image
```

Run `vp run generate:og` to preview regenerated cards without building the entire site. Generated
PNGs are ignored by Git because both development and production build commands recreate them.

Image selection is predictable:

- General site pages use `public/images/android-chrome-512x512.png`.
- Posts with `social_image` use that image.
- Posts without `social_image`, including the current snippets, use the same site avatar fallback.
- `hello-world` currently uses `src/assets/images/posts/desktop_view.jpeg`.
- `final-fantasy-7-remake-review` currently uses
  `src/assets/images/posts/final-fantasy-7-remake/final-fantasy-7-remake-01.jpg`.

Posts in the `game-review` category also require review details. These appear as a prominent score
and facts panel below the post title.

```yaml
review:
  rating: 4
  platform: PC
  playtime_hours: 23.4
  status: Finished
```

Useful commands:

- `vp run check`: type-check the project
- `vp run build`: clean old output, build every route, and verify the Cloudflare Pages bundle
- `vp preview`: preview the production build locally

## Cloudflare Pages

This site is fully prerendered. Configure the Pages project with:

- Framework preset: `None`
- Build command: `vp run build`
- Build output directory: `dist/client`
- Root directory: `/`

Do not publish `dist`. TanStack Start places the deployable static site in `dist/client` and its
server bundle in `dist/server`. The build starts by deleting the entire `dist` folder and fails if
the static output contains an old `/_astro/` reference or a missing generated asset.

When migrating an existing Pages project from Astro, update the output directory, clear the Pages
build cache, and redeploy. If a custom Cloudflare Cache Rule caches HTML, purge that cache after the
first corrected deployment.
