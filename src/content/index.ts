import { createElement, type ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import rawConfig from "virtual:site-config";
import type { SiteConfig, PostFrontmatter } from "./schema";
import type { Heading } from "./headings";
export type { SiteConfig } from "./schema";

type MdxModule = {
  default: ComponentType<{ components?: MDXComponents }>;
  frontmatter: PostFrontmatter;
};

export type Category = SiteConfig["categories"][number];
export type Tool = SiteConfig["tools"][number];
export type Skill = SiteConfig["skills"][number];
export type Post = PostFrontmatter & {
  id: string;
  slug: string;
  kind: "blog" | "snippets";
  readingTime?: string;
  headings: Heading[];
  Content: MdxModule["default"];
};

const postMetadata = import.meta.glob("./posts/**/*.mdx", {
  eager: true,
  query: "?metadata",
  import: "default",
}) as Record<string, { frontmatter: PostFrontmatter; readingTime?: string; headings: Heading[] }>;
const postLoaders = import.meta.glob<MdxModule>("./posts/**/*.mdx");
const loadedContent = new Map<string, MdxModule["default"]>();
const loadingContent = new Map<string, Promise<void>>();

function loadContent(path: string) {
  let pending = loadingContent.get(path);
  if (!pending) {
    pending = postLoaders[path]()
      .then((module) => {
        loadedContent.set(path, module.default);
      })
      .catch((error) => {
        loadingContent.delete(path);
        throw error;
      });
    loadingContent.set(path, pending);
  }
  return pending;
}

export const siteConfig = rawConfig;
export const { site, terminal, socialLinks, categories, tools, skills } = siteConfig;

export const posts: Post[] = Object.entries(postMetadata).map(([path, module]) => {
  const relative = path.replace("./posts/", "").replace(/\.mdx$/, "");
  const [kind, ...slugParts] = relative.split("/");
  if (kind !== "blog" && kind !== "snippets") throw new Error(`Unknown post kind: ${kind}`);

  return {
    id: relative,
    slug: slugParts.join("/"),
    kind,
    readingTime: module.readingTime,
    headings: module.headings,
    Content: (props) => {
      const Content = loadedContent.get(path);
      if (!Content) throw loadContent(path);
      return createElement(Content, props);
    },
    ...module.frontmatter,
    published_time: new Date(module.frontmatter.published_time),
    last_modified_time: module.frontmatter.last_modified_time
      ? new Date(module.frontmatter.last_modified_time)
      : undefined,
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

/** Resolve the article before its route renders, on both the server and the client. */
export async function loadPost(kind: Post["kind"], slug: string) {
  const post = getPost(kind, slug);
  if (post) await loadContent(`./posts/${post.id}.mdx`);
  return post;
}
