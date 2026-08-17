import type { Post } from "$content/index";
import { getCategory } from "$content/index";
import { formatDate } from "$utils/date-formatter";
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
      <article data-type={category?.id} className="space-y-4">
        <header
          className="flex flex-col gap-6"
          style={{ viewTransitionName: transitionName(post.title) }}
        >
          <div className="category-surface relative z-20 flex items-center justify-center rounded-md p-4">
            <h1 className="relative z-20 text-center font-site-heading text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-wide text-site-category-foreground [text-wrap:balance]">
              <span>{post.title}</span>
            </h1>
          </div>
          {post.review && <ReviewDetails review={post.review} />}
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <span className="flex items-center gap-2 rounded-md border border-site-border bg-site-card px-2 py-1">
              <Icon name="mdi:calendar" className="text-site-icon-hover" />
              {formatDate(post.published_time)}
            </span>
            {post.last_modified_time && (
              <span className="flex items-center gap-2 rounded-md border border-site-border-hover bg-site-card px-2">
                <Icon name="mdi:update" className="text-site-icon-hover" />
                {formatDate(post.last_modified_time)}
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

function ReviewDetails({ review }: { review: NonNullable<Post["review"]> }) {
  return (
    <section
      aria-label="Review details"
      className="overflow-hidden rounded-md border border-site-category-border bg-site-card"
    >
      <div className="category-surface flex items-center justify-between gap-4 px-4 py-3 text-site-category-foreground">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide opacity-80">Review score</p>
          <div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              const icon =
                review.rating >= value
                  ? "mdi:star"
                  : review.rating >= value - 0.5
                    ? "mdi:star-half-full"
                    : "mdi:star-outline";
              return <Icon key={value} name={icon} className="text-xl" />;
            })}
          </div>
        </div>
        <strong className="font-mono text-3xl tabular-nums tracking-tight">
          {review.rating}
          <span className="text-base font-medium opacity-70"> / 5</span>
        </strong>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-site-border text-center">
        <div className="px-2 py-3">
          <dt className="text-xs text-site-muted">Status</dt>
          <dd className="mt-0.5 text-sm font-semibold text-site-foreground">{review.status}</dd>
        </div>
        <div className="px-2 py-3">
          <dt className="text-xs text-site-muted">Platform</dt>
          <dd className="mt-0.5 text-sm font-semibold text-site-foreground">{review.platform}</dd>
        </div>
        <div className="px-2 py-3">
          <dt className="text-xs text-site-muted">Playtime</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-site-foreground">
            {review.playtime_hours}h
          </dd>
        </div>
      </dl>
    </section>
  );
}
