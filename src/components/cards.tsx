import { Link } from "@tanstack/react-router";
import type { ElementType } from "react";
import type { Post, Skill, Tool } from "$content/index";
import { getCategory, postPath } from "$content/index";
import { formatDate } from "$utils/date-formatter";
import { Icon } from "./icon";

function transitionName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function BlogCard({ post, as: Heading = "h3" }: { post: Post; as?: ElementType }) {
  return <PostListCard post={post} heading={Heading} />;
}

export function SnippetCard({ snippet, as: Heading = "h4" }: { snippet: Post; as?: ElementType }) {
  return <PostListCard post={snippet} heading={Heading} />;
}

function PostListCard({ post, heading: Heading }: { post: Post; heading: ElementType }) {
  const category = getCategory(post.category);
  return (
    <Link
      to={postPath(post) as any}
      data-type={category?.name.toLowerCase()}
      className="group flex items-center justify-between gap-3 border-b border-site-border px-1 py-1.5 transition-colors duration-150 hover:border-site-category-border hover:text-site-heading"
      style={{ viewTransitionName: transitionName(post.title) }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-site-category">
          <Icon name={category?.icon} className="text-xs text-site-category-foreground" />
        </div>
        <Heading className="truncate font-site-heading text-sm font-semibold tracking-wide">
          {post.title}
        </Heading>
      </div>
      <time
        className="hidden shrink-0 font-mono text-xs text-site-datetime sm:block"
        dateTime={post.published_time.toISOString()}
      >
        {formatDate(post.published_time)}
      </time>
    </Link>
  );
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <a
      href={tool.url}
      title={tool.description}
      className="group flex min-w-0 cursor-pointer items-center gap-2 rounded-md border-x border-b-2 border-t border-site-border bg-site-card p-2 transition-[border-color,background-color,transform] duration-150 hover:-translate-y-px hover:border-site-border-hover hover:bg-site-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-ring"
      rel="external nofollow"
      style={{ viewTransitionName: transitionName(tool.title) }}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-site-button text-site-icon-hover transition-transform duration-150 group-hover:scale-105">
        <Icon name={tool.icon} className="text-xl" />
      </span>
      <h4 className="min-w-0 truncate font-site-heading text-sm font-bold leading-tight tracking-wide">
        {tool.title}
      </h4>
    </a>
  );
}

export function SkillContainer({ skill }: { skill: Skill }) {
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[12rem_1fr] sm:items-center">
      <h3 className="font-site-heading text-sm font-semibold tracking-wide text-site-foreground">
        {skill.title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {skill.entries.map((entry) => (
          <div
            key={entry.name}
            className="group relative grid h-9 w-9 place-items-center rounded-md transition-colors duration-150 hover:bg-site-card-hover"
          >
            <span className="pointer-events-none absolute left-1/2 top-0 z-20 inline-block w-max -translate-x-1/2 -translate-y-9 scale-95 rounded-md border border-site-border bg-site-card px-2 py-1 text-xs font-bold opacity-0 shadow-lg transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
              {entry.name}
            </span>
            <Icon
              name={entry.icon}
              className="text-2xl text-site-foreground opacity-75 transition-all duration-150 group-hover:scale-110 group-hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
