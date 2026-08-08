import { site } from "$content/index";

const siteUrl = site.url;
const socialImage = `${siteUrl}/images/android-chrome-192x192.png`;

export function seo({
  title,
  description,
  path = "/",
  type = "website",
  published,
  tags,
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  published?: Date;
  tags?: string[];
}) {
  const url = new URL(path, siteUrl).href;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: socialImage },
      ...(published
        ? [{ property: "article:published_time", content: published.toISOString() }]
        : []),
      ...(tags ? [{ property: "article:tag", content: tags.join(", ") }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: socialImage },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
