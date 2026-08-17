import { site } from "$content/index";

const siteUrl = site.url;
const defaultSocialImagePath = "/images/og/default.png";

export function seo({
  title,
  description,
  path = "/",
  type = "website",
  published,
  modified,
  tags,
  image = defaultSocialImagePath,
  imageAlt,
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  published?: Date;
  modified?: Date;
  tags?: string[];
  image?: string;
  imageAlt?: string;
}) {
  const url = new URL(path, siteUrl).href;
  const socialImage = new URL(image, siteUrl).href;
  const socialImageAlt = imageAlt ?? `${title} | ${site.name}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "theme-color", content: "#0b0a0f" },
      { property: "og:type", content: type },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: socialImage },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: socialImageAlt },
      ...(published
        ? [{ property: "article:published_time", content: published.toISOString() }]
        : []),
      ...(modified
        ? [{ property: "article:modified_time", content: modified.toISOString() }]
        : []),
      ...(tags ?? []).map((tag) => ({ property: "article:tag", content: tag })),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: socialImage },
      { name: "twitter:image:alt", content: socialImageAlt },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
