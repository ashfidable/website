import { useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TerminalStatusSlot } from "./status-slot";
import { getCategory, type Post } from "$content/index";
import { Icon } from "../icon";
import { LinkPreviews } from "../link-preview";
import { extractHeadings, mdxComponents } from "../mdx";
import { usePostLikes } from "@/features/post-likes/use-post-likes";
import { focusRing, isoDate, latestPosts, latestSnippets } from "./data";
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

/** Like controls shared by the article header and reading status bar. */
function LikeButton({
  state,
  compact = false,
}: {
  state: ReturnType<typeof usePostLikes>;
  compact?: boolean;
}) {
  const { likes, sendLike, done, pending, saving, limited } = state;
  const busy = pending || saving;
  return (
    <button
      type="button"
      onClick={sendLike}
      disabled={busy || limited || done}
      aria-busy={busy}
      aria-label={`${pending ? "…" : likes.total}${compact ? "" : limited ? " try again in 1 min" : done ? " thanks!" : " +1"}. ${limited ? "Try again in 1 minute" : done ? "Five likes sent" : "Like this post"}`}
      className={`group inline-flex items-center gap-2 rounded disabled:cursor-default ${
        compact
          ? "-my-1.5 h-10 px-1 motion-safe:[&:enabled:hover_svg]:scale-110 motion-safe:[&:enabled:active_svg]:scale-95"
          : "border border-site-border px-2 transition-colors hover:border-site-border-hover"
      } ${focusRing}`}
    >
      <Icon
        key={likes.taps}
        name="mdi:heart"
        className={`text-red-500 ${compact ? "text-2xl motion-safe:transition-transform motion-safe:duration-150" : ""} ${busy ? "animate-pulse" : likes.taps > 0 ? "like-heart-hit" : ""}`}
      />
      <span className="tabular-nums" aria-live="polite">
        {pending ? "…" : likes.total}
      </span>
      {!compact && (
        <span className="text-site-muted group-hover:text-site-foreground">
          {limited ? "try again in 1 min" : done ? "thanks!" : "+1"}
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
  const navigate = useNavigate();
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

  const headings = extractHeadings(post.body);
  const Content = post.Content;
  const folder = post.kind === "blog" ? "~/blog" : "~/snippets";
  const siblings = post.kind === "blog" ? latestPosts : latestSnippets;
  const others = siblings.filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <>
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
                        {isoDate(post.published_time)}
                      </time>
                      {post.last_modified_time && (
                        <span className="text-site-muted">
                          {" "}
                          · updated{" "}
                          <time dateTime={post.last_modified_time.toISOString()}>
                            {isoDate(post.last_modified_time)}
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
                <p className="flex flex-wrap items-center gap-2 text-site-muted">
                  # enjoyed it? <LikeButton state={likes} />
                </p>
                <PostRows items={others} />
                <MoreLink
                  onClick={() => navigate({ to: post.kind === "blog" ? "/blog" : "/snippets" })}
                >
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
