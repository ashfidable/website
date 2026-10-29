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

## Contributing

Found a bug or have an idea? Open an issue or send a pull request. For bigger changes, start an issue so we can talk it through first.

You're welcome to fork this and build your own garden. It's available under the [MIT license](LICENSE).
