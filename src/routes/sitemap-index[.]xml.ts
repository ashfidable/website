import { createFileRoute } from "@tanstack/react-router";
import { categories, posts, postPath } from "$content/index";
const urls = [
  "/",
  "/blog",
  "/snippets",
  "/tools",
  ...posts.map(postPath),
  ...categories.map((category) => `/tools/${category.id}`),
];
export const Route = createFileRoute("/sitemap-index.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>https://ashfid.dev${url}</loc></url>`).join("")}</urlset>`,
          { headers: { "content-type": "application/xml; charset=utf-8" } },
        ),
    },
  },
} as any);
