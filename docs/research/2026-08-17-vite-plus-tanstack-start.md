# Vite+ and TanStack Start migration

Research date: 17 August 2026

## Conclusion

The site uses **TanStack Start**, not “TanStack Shard.” The official product styling for the toolchain is **Vite+**.

A supportable explanation for the migration is that the two tools have distinct roles:

- TanStack describes Start as a full-stack React framework powered by TanStack Router. It supplies the application layer, including routing, rendering, server features, and client/server builds. It officially supports Vite and Rsbuild as build tools. ([TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview))
- Vite+ describes itself as a unified toolchain that provides one entry point for the runtime, dependency management, development server, checks, testing, and production builds. Its documented workflow includes `vp dev`, `vp check`, `vp test`, and `vp build`. ([Why Vite+?](https://viteplus.dev/guide/why), [Vite+ getting started](https://viteplus.dev/guide/))

The compatibility of this exact pairing is an inference from the official documentation: TanStack Start supports Vite, while Vite+ says it integrates with the existing Vite ecosystem and frameworks built on it. Neither official site currently documents a separate TanStack Start–Vite+ integration. ([TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview), [Why Vite+?](https://viteplus.dev/guide/why))

## Repository evidence

- [`package.json`](../../package.json) depends on `@tanstack/react-start` and `vite-plus`; its development, build, preview, and formatting scripts use the `vp` command.
- [`vite.config.ts`](../../vite.config.ts) imports `tanstackStart` from `@tanstack/react-start/plugin/vite`, imports its configuration helpers from `vite-plus`, and enables prerendering with link crawling.
- [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) aliases `vite` to `@voidzero-dev/vite-plus-core`, matching the migration approach in the official [Vite+ migration guide](https://viteplus.dev/guide/migrate).

This evidence supports saying the site now uses TanStack Start with Vite+, and that the change consolidates its development tooling while putting the application on TanStack Start's Router-based React framework. It does **not** establish personal motives or measurable improvements such as a faster feedback loop, reduced maintenance, or better site performance.

## Recommended callout wording

> **Updated 17 August 2026:** This post describes the site's original Astro and Svelte build. The site now uses **TanStack Start** with **Vite+**. TanStack Start provides the Router-based React application layer, while Vite+ brings development, builds, linting, formatting, and related tooling into one workflow. The original sections remain below as a record of how the site was first built.

This wording explains the practical change without claiming undocumented personal motives or performance gains. “Related tooling” is deliberately narrower than claiming that this repository actively uses every capability Vite+ ships.

## Status caveat

As of the research date, TanStack labels Start as a Release Candidate, and Vite+ describes itself as beta (“stable, but not yet complete”). These statuses do not need to be in a short blog callout, but they should be considered before making stronger stability claims. ([TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview), [Vite+ troubleshooting](https://viteplus.dev/guide/troubleshooting))
