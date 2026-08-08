import type { Post } from "$content/index";
import { getCategory } from "$content/index";
import { formatDateSlash } from "$utils/date-formatter";
import { getReadingTime } from "$utils/reading-time";
import { BackToTop } from "./back-to-top";
import { Icon } from "./icon";
import { extractHeadings, mdxComponents, TableOfContents } from "./mdx";

function transitionName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function PostPage({ post }: { post: Post }) {
  const category = getCategory(post.category);
  const Content = post.Content;
  return (
    <>
      <BackToTop />
      <article data-type={category?.name.toLowerCase()} className="space-y-4">
        <header
          className="flex flex-col gap-6"
          style={{ viewTransitionName: transitionName(post.title) }}
        >
          <div className="relative z-20 flex items-center justify-center rounded-md bg-site-category p-4">
            <h1 className="relative z-20 text-center font-site-heading text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-wide text-site-category-foreground [text-wrap:balance]">
              <span>{post.title}</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <span className="flex items-center gap-2 rounded-md border border-site-border bg-site-card px-2 py-1">
              <Icon name="mdi:calendar" className="text-site-icon-hover" />
              {formatDateSlash(post.published_time)}
            </span>
            {post.last_modified_time && (
              <span className="flex items-center gap-2 rounded-md border border-site-border-hover bg-site-card px-2">
                <Icon name="mdi:update" className="text-site-icon-hover" />
                {formatDateSlash(post.last_modified_time)}
              </span>
            )}
            <span className="flex items-center gap-2 rounded-md border border-site-border bg-site-card px-2 py-1">
              <Icon name={category?.icon} className="text-site-icon-hover" />
              {category?.name}
            </span>
            <span className="flex items-center gap-2 rounded-md border border-site-border bg-site-card px-2">
              <Icon name="mdi:clock-time-one-outline" className="text-site-icon-hover" />
              {getReadingTime(post.body)}
            </span>
          </div>
        </header>
        <TableOfContents headings={extractHeadings(post.body)} />
        <article className="flex snap-y flex-col">
          <Content components={mdxComponents} />
        </article>
      </article>
    </>
  );
}
