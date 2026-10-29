import { blogPosts, skills, snippets, terminal, type Post } from "$content/index";

const byNewest = (a: Post, b: Post) => b.published_time.getTime() - a.published_time.getTime();

export const latestPosts = [...blogPosts].sort(byNewest);
export const latestSnippets = [...snippets].sort(byNewest);
export const sortedSkills = [...skills].sort((a, b) => b.entries.length - a.entries.length);

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-2 focus-visible:ring-offset-site-page";

export function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** `user@host`, from the "terminal" block in site.config.json. */
export const shellUser = `${terminal.user}@${terminal.host}`;

/** zsh's default prompt (`%n@%m %1~ %# `) shows only the current folder: `~`, `blog`, `config`. */
export function shellDir(path: string) {
  return path === "~" ? "~" : (path.split("/").pop() ?? path);
}
