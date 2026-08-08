import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import { z } from "zod";
import rawConfig from "../../site.config.json";

const iconLinkSchema = z.object({ name: z.string(), url: z.string(), icon: z.string() });
const siteSchema = z.object({
  name: z.string(),
  title: z.string(),
  url: z.string().url(),
  description: z.string(),
  discordId: z.string(),
  supportUrl: z.string().url(),
});
const categorySchema = z.object({ id: z.string(), name: z.string(), icon: z.string() });
const toolSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
  url: z.string().url(),
  icon: z.string(),
});
const skillSchema = z.object({
  id: z.string(),
  title: z.string(),
  entries: z.array(z.object({ name: z.string(), icon: z.string() })),
});
const configSchema = z.object({
  site: siteSchema,
  navigation: z.array(iconLinkSchema),
  socialLinks: z.array(iconLinkSchema),
  categories: z.array(categorySchema),
  tools: z.array(toolSchema),
  skills: z.array(skillSchema),
});
const postSchema = z.object({
  title: z.string().max(60),
  description: z.string().max(160),
  url: z.string().optional(),
  published_time: z.coerce.date(),
  last_modified_time: z.coerce.date().optional(),
  category: z.string(),
  tags: z.array(z.string()),
});

type MdxModule = {
  default: ComponentType<{ components?: MDXComponents }>;
  frontmatter: Record<string, unknown>;
  source: string;
};

export type SiteConfig = z.infer<typeof configSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Tool = z.infer<typeof toolSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Post = z.infer<typeof postSchema> & {
  id: string;
  slug: string;
  kind: "blog" | "snippets";
  body: string;
  Content: MdxModule["default"];
};

const postModules = import.meta.glob("./posts/**/*.mdx", { eager: true }) as Record<
  string,
  MdxModule
>;

export const siteConfig = configSchema.parse(rawConfig);
export const { site, navigation, socialLinks, categories, tools, skills } = siteConfig;

export const posts: Post[] = Object.entries(postModules).map(([path, module]) => {
  const relative = path.replace("./posts/", "").replace(/\.mdx$/, "");
  const [kind, ...slugParts] = relative.split("/");
  if (kind !== "blog" && kind !== "snippets") throw new Error(`Unknown post kind: ${kind}`);

  return {
    id: relative,
    slug: slugParts.join("/"),
    kind,
    body: module.source,
    Content: module.default,
    ...postSchema.parse(module.frontmatter),
  };
});

export const blogPosts = posts.filter((post) => post.kind === "blog");
export const snippets = posts.filter((post) => post.kind === "snippets");

export function getCategory(id: string) {
  return categories.find((category) => category.id === id);
}

export function getPost(kind: Post["kind"], slug: string) {
  return posts.find((post) => post.kind === kind && post.slug === slug);
}

export function postPath(post: Post) {
  return `/${post.kind}/${post.slug}`;
}
