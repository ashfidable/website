import { createFileRoute } from "@tanstack/react-router";
import { posts, postPath } from "$content/index";
const escape = (value: string) =>
  value.replace(
    /[<>&'\"]/g,
    (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!,
  );
export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: () => {
        const items = posts
          .map(
            (post) =>
              `<item><title>${escape(post.title)}</title><link>https://ashfid.dev${postPath(post)}</link><guid>https://ashfid.dev${postPath(post)}</guid><pubDate>${post.published_time.toUTCString()}</pubDate><description>${escape(post.description)}</description><category>${escape(post.tags.join(", "))}</category></item>`,
          )
          .join("");
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Ashfid&apos;s Posts</title><link>https://ashfid.dev</link><description>Ashfid&apos;s digital garden.</description><language>en-us</language>${items}</channel></rss>`,
          { headers: { "content-type": "application/rss+xml; charset=utf-8" } },
        );
      },
    },
  },
} as any);
