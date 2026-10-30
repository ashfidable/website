# ashfid.dev / ashfid.com

I'm Ashfid, a software engineer and game developer. This is my digital garden, where I share what I'm learning, write about games and their mechanics, and keep useful bits of code so I can find them again.

I wanted it to feel cozy and a little playful, so it lives inside a small terminal window with a pixel version of me. Pick a theme, browse the posts, or try a command in the prompt.

Visit the garden at [ashfid.dev](https://ashfid.dev) or [ashfid.com](https://ashfid.com).

Built with TanStack Start, React, MDX, and Tailwind CSS. Pages are generated ahead of time and hosted on Cloudflare.

## Run it locally

Fork or clone the repo, then run these from the project folder with Vite+ installed:

```sh
vp install
vp run db:migrate:local
vp run dev
```

Open [localhost:3000](http://localhost:3000). The database step sets up local storage for post likes; you only need it on the first run or when the database changes.

## Make it yours

Start with [site.config.json](site.config.json) for your name, links, tools, and skills. Posts and snippets live in [src/content/posts](src/content/posts). Copy an existing MDX file to get started; its filename becomes the URL.

Swap out my images and branding, and change whatever you like. If you're deploying your own copy, update [wrangler.jsonc](wrangler.jsonc) with your Cloudflare settings too. `vp run build` creates the production build.

## Automatic production builds

Push source changes; the hosting build runs `vp run build`. It generates social cards, fetches previews for new external links, creates responsive AVIF/WebP images, and pre-renders the pages. No local generation or generated-image commits are required.

Image transforms use `node_modules/.cache/imagetools`, keyed by source bytes and transform options. Social cards use `.cache/og` plus `public/images/og`. These caches are optional: a fresh checkout generates everything automatically. AVIF uses a faster encoder setting while retaining the same quality setting and responsive image sizes.

For Cloudflare Workers Builds, use `vp run build` as the build command and `vp run deploy` as the deploy command. Enable **Settings → Build → Build cache** for dependency caching. Cloudflare's [documented cache support](https://developers.cloudflare.com/workers/ci-cd/builds/build-caching/) does not currently list TanStack Start's custom image/OG directories, so cold builds are optimized too; do not assume those directories survive between Cloudflare builds.

Existing external-link previews are reused, and new links are fetched automatically. A failed third-party preview does not fail the build. To explicitly refresh existing previews, run `vp run generate:link-previews -- --refresh`, locally or in the hosting build command.

## Contributing

Found a bug or have an idea? Open an issue or send a pull request. For bigger changes, start an issue so we can talk it through first.

You're welcome to fork this and build your own garden. It's available under the [MIT license](LICENSE).
