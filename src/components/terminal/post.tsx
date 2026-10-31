import { useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TerminalStatusSlot } from "./status-slot";
import { getCategory, type Post } from "$content/index";
import { Icon } from "../icon";
import { LinkPreviews } from "../link-preview";
import { mdxComponents } from "../mdx";
import { LikeCelebration } from "@/features/post-likes/like-celebration";
import { usePostLikes } from "@/features/post-likes/use-post-likes";
import { QueryProvider } from "@/providers/query-provider";
import { focusRing, formatDate, latestPosts, latestSnippets } from "./data";
import { MoreLink, PostRows, Script, minutes } from "./ui";

function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating} out of 5`}>
      <span aria-hidden="true" className="text-site-heading">
        {Array.from({ length: 5 }, (_, index) => (rating >= index + 1 ? "★" : "☆")).join("")}
      </span>{" "}
      {rating}/5
    </span>
  );
}

const combos = ["+1", "x2", "x3!", "x4!!", "MAX!"];
const sparks = [
  ["♥", -30, -22],
  ["*", 30, -24],
  ["+", -38, 6],
  ["♥", 36, 8],
  ["*", -14, -36],
  ["+", 14, -34],
] as const;

/** Like controls shared by the article header and reading status bar. */
function LikeButton({
  state,
  compact = false,
}: {
  state: ReturnType<typeof usePostLikes>;
  compact?: boolean;
}) {
  const { likes, sendLike, done, pending, saving, limited, error } = state;
  // The status bar button mounts mid-read, and shouldn't replay the last tap.
  const [tapsOnMount] = useState(likes.taps);
  const remaining = 5 - likes.taps;
  const hint = limited
    ? "try again in 1 min"
    : error
      ? "retry like"
      : done
        ? saving
          ? "saving…"
          : "all 5 sent!"
        : likes.taps
          ? `${remaining} more!`
          : "+1";
  return (
    <button
      data-js-only
      type="button"
      onClick={sendLike}
      disabled={pending || limited || done}
      aria-label={`${likes.total} likes. ${likes.taps} of 5 hearts given. ${limited ? "Try again in one minute" : error ? "Could not save. Try again" : done ? (saving ? "Saving likes" : "All five likes sent. Thank you") : `Like this post, ${remaining} remaining`}`}
      className={`group relative min-h-10 items-center rounded py-1 transition-colors disabled:cursor-default ${
        compact
          ? "-my-1 inline-flex gap-1 px-1"
          : `inline-flex flex-wrap gap-x-2 gap-y-1 border px-2 hover:bg-site-card-hover ${likes.taps ? "border-red-500/60" : "border-site-border hover:border-site-border-hover"}`
      } ${focusRing}`}
    >
      {/* One heart that fills from the bottom with each tap. */}
      <span
        key={`heart-${likes.taps}`}
        aria-hidden="true"
        className={`relative inline-flex text-red-500 ${compact ? "text-xl" : "text-lg"} ${likes.taps > tapsOnMount ? "like-heart-hit" : ""}`}
      >
        <Icon name="mdi:heart-outline" />
        <span
          className="absolute inset-0"
          style={{ clipPath: `inset(${100 - likes.taps * 20}% 0 0 0)` }}
        >
          <Icon name="mdi:heart" className="block" />
        </span>
      </span>
      <span
        key={`count-${likes.total}`}
        className={`inline-block tabular-nums ${likes.taps > tapsOnMount ? "like-heart-hit" : ""}`}
      >
        {pending ? "…" : likes.total}
      </span>
      {(!compact || limited || error) && (
        <span
          className={`text-site-muted group-hover:text-site-foreground ${compact ? "text-xs" : ""}`}
        >
          {hint}
        </span>
      )}
      {likes.taps > tapsOnMount && (
        <span key={`pop-${likes.taps}`} aria-hidden="true" className="pointer-events-none">
          <span className="like-pop absolute bottom-full left-1/2 font-bold text-red-500">
            {combos[likes.taps - 1]}
          </span>
          {sparks.slice(0, likes.taps + 1).map(([glyph, x, y], index) => (
            <span
              key={index}
              className="like-spark absolute left-1/2 top-1/2 text-red-500"
              style={{ "--spark-x": `${x}px`, "--spark-y": `${y}px` } as CSSProperties}
            >
              {glyph}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="contents">
      <dt className="text-site-heading">{label}:</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/** A blog post or snippet as `cat post.mdx`: frontmatter header, contents, then the article. */
export function TerminalPost({ post }: { post: Post }) {
  return (
    <QueryProvider>
      <PostContent key={post.id} post={post} />
    </QueryProvider>
  );
}

function PostContent({ post }: { post: Post }) {
  const category = getCategory(post.category);
  const likes = usePostLikes(`${post.category}:${post.slug}`);
  const statusSlot = useContext(TerminalStatusSlot);
  const topLike = useRef<HTMLSpanElement>(null);
  const postBody = useRef<HTMLDivElement>(null);
  const [showStatusLike, setShowStatusLike] = useState(false);

  useEffect(() => {
    const target = topLike.current;
    const panel = target?.closest("[data-terminal-scroll]");
    if (!target || !panel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStatusLike(
          !entry.isIntersecting &&
            target.getClientRects().length > 0 &&
            entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0),
        );
      },
      { root: panel, threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [post.id]);

  const headings = post.headings;
  const Content = post.Content;
  const folder = post.kind === "blog" ? "~/blog" : "~/snippets";
  const siblings = post.kind === "blog" ? latestPosts : latestSnippets;
  const others = siblings.filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <>
      <LikeCelebration state={likes} anchor={topLike} />
      <span role="status" className="sr-only">
        {likes.error
          ? "Could not save your likes. Please try again."
          : likes.limited
            ? "Like limit reached. Try again in one minute."
            : likes.likes.taps > 0
              ? `${likes.likes.taps} of 5 hearts given. ${5 - likes.likes.taps} remaining.`
              : ""}
      </span>
      {statusSlot &&
        showStatusLike &&
        createPortal(<LikeButton state={likes} compact />, statusSlot)}
      <Script
        path={folder}
        steps={[
          {
            command: `cat ${post.slug}.mdx`,
            content: (
              <article data-terminal-post data-type={category?.id}>
                <header className="space-y-3">
                  <p aria-hidden="true" className="hidden text-site-muted sm:block">
                    ---
                  </p>
                  <h1 className="max-w-[40ch] text-xl font-bold leading-snug text-site-heading [text-wrap:balance] md:text-2xl">
                    {post.title}
                  </h1>
                  <p className="max-w-[72ch] text-site-muted">{post.description}</p>
                  <dl className="grid grid-cols-[5rem_minmax(0,1fr)] gap-y-1 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                    <Meta label="date">
                      <time dateTime={post.published_time.toISOString()}>
                        {formatDate(post.published_time)}
                      </time>
                      {post.last_modified_time && (
                        <span className="text-site-muted">
                          {" "}
                          · updated{" "}
                          <time dateTime={post.last_modified_time.toISOString()}>
                            {formatDate(post.last_modified_time)}
                          </time>
                        </span>
                      )}
                    </Meta>
                    <Meta label="category">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name={category?.icon} className="text-site-icon-hover" />
                        {category?.name}
                      </span>
                    </Meta>
                    <Meta label="read">{minutes(post)}</Meta>
                    {post.review && (
                      <>
                        <Meta label="rating">
                          <Stars rating={post.review.rating} />
                        </Meta>
                        <Meta label="played">
                          {post.review.platform} · {post.review.playtime_hours}h ·{" "}
                          {post.review.status}
                        </Meta>
                      </>
                    )}
                    <Meta label="likes">
                      <span ref={topLike} className="inline-flex">
                        <LikeButton state={likes} />
                      </span>
                    </Meta>
                  </dl>
                  <p aria-hidden="true" className="hidden text-site-muted sm:block">
                    ---
                  </p>
                </header>

                {headings.length > 0 && (
                  <nav
                    aria-label="Table of contents"
                    className="mt-6 max-w-[72ch] rounded-md border border-site-border bg-site-card px-3 py-2"
                  >
                    <p className="text-site-heading"># contents</p>
                    <ol className="mt-1 sm:columns-2 sm:gap-6">
                      {headings.map((heading) => (
                        <li
                          key={heading.slug}
                          className={`break-inside-avoid ${
                            heading.depth === 4 ? "pl-8" : heading.depth === 3 ? "pl-4" : ""
                          }`}
                        >
                          <a
                            href={`#${heading.slug}`}
                            onClick={(event) => {
                              event.preventDefault();
                              const target = document.getElementById(heading.slug);
                              target?.setAttribute("tabindex", "-1");
                              target?.focus({ preventScroll: true });
                              target?.scrollIntoView({
                                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                                  ? "instant"
                                  : "smooth",
                              });
                              history.replaceState(history.state, "", `#${heading.slug}`);
                            }}
                            className={`-mx-2 block rounded px-2 py-1 text-site-muted transition-colors hover:bg-site-card-hover hover:text-site-heading md:py-0.5 ${focusRing}`}
                          >
                            <span aria-hidden="true">› </span>
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}

                <div
                  ref={postBody}
                  data-post-body
                  className="mt-10 max-w-[72ch] break-words leading-[1.75]"
                >
                  <Content components={mdxComponents} />
                </div>
                <LinkPreviews container={postBody} />
              </article>
            ),
          },
          {
            command: `ls -lt ${folder} | head -3`,
            label: post.kind === "blog" ? "More posts" : "More snippets",
            content: (
              <div className="space-y-3">
                <p data-js-only className="flex flex-wrap items-center gap-2 text-site-muted">
                  # enjoyed it? <LikeButton state={likes} />
                </p>
                <PostRows items={others} />
                <MoreLink to={post.kind === "blog" ? "/blog" : "/snippets"}>
                  → all{" "}
                  {post.kind === "blog"
                    ? `${latestPosts.length} posts`
                    : `${latestSnippets.length} snippets`}
                </MoreLink>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
