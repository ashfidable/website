import { Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { flushSync } from "react-dom";
import { getCategory, postPath, type Post, type Tool } from "$content/index";
import { getReadingTime } from "$utils/reading-time";
import { Icon } from "../icon";
import { focusRing, isoDate, shellDir, shellUser } from "./data";

export const CHAR_MS = 22;
const GAP_MS = 140;
const ROW_GAP_MS = 140;

export const stackLabels: Record<string, string> = {
  "programming-languages": "languages",
  "frontend-and-backend": "web",
  "game-engines": "engines",
};

/** macOS zsh's default prompt: `ashfid@garden blog % `. Name comes from site.config.json. */
export function Prompt({ path = "~" }: { path?: string }) {
  return (
    <>
      <span className="font-bold text-site-heading">{shellUser}</span>{" "}
      <span className="text-site-datetime">{shellDir(path)}</span>{" "}
      <span className="text-site-muted">%</span>{" "}
    </>
  );
}

export type Step = {
  command: string;
  label?: string;
  content: ReactNode;
  staggerRows?: number;
};

/** Types each command, then fades in its output — replays whenever it remounts. */
export function Script({
  steps,
  path,
  headingLevel = 2,
}: {
  steps: Step[];
  path: string;
  headingLevel?: 1 | 2;
}) {
  let clock = 60;
  const timing = steps.map(({ command, staggerRows }) => {
    const start = clock;
    const output = start + command.length * CHAR_MS + 60;
    clock = output + Math.max(0, (staggerRows ?? 1) - 1) * ROW_GAP_MS + GAP_MS;
    return { start, output };
  });

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const Tag = step.label ? (headingLevel === 1 && index === 0 ? "h1" : "h2") : "p";
        return (
          <section key={step.command}>
            <Tag className={`break-words font-normal ${step.label ? "" : "hidden sm:block"}`}>
              {step.label && (
                <span className="font-semibold text-site-heading sm:sr-only">{step.label}</span>
              )}
              <span className="hidden sm:inline" aria-hidden={step.label ? true : undefined}>
                <Prompt path={path} />
                <span
                  className="type-in"
                  style={
                    {
                      "--chars": String(step.command.length),
                      "--char-ms": `${CHAR_MS}ms`,
                      "--delay": `${timing[index].start}ms`,
                    } as CSSProperties
                  }
                >
                  {step.command}
                </span>
              </span>
            </Tag>
            <div
              className={`${step.staggerRows ? "stagger-output" : "fade-in-late"} mt-2`}
              style={
                {
                  "--delay": `${timing[index].output}ms`,
                  "--row-gap": `${ROW_GAP_MS}ms`,
                } as CSSProperties
              }
            >
              {step.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-b-2 border-site-border bg-site-card px-1.5 text-xs leading-5 text-site-foreground">
      {children}
    </kbd>
  );
}

export function minutes(post: Post) {
  return getReadingTime(post.body)?.replace(/s? read$/, "") ?? "";
}

export function filterEntries(items: Post[], needle: string) {
  if (!needle) return items;
  return items.filter((post) =>
    [post.title, post.description, post.category, ...post.tags]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "gi")).map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="rounded-sm bg-site-heading/25 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function PostRows({
  items,
  query = "",
  detailed = false,
}: {
  items: Post[];
  query?: string;
  detailed?: boolean;
}) {
  return (
    <ul>
      {items.map((post, index) => {
        const category = getCategory(post.category);
        return (
          <li key={post.id} data-reveal-row style={{ "--row": String(index) } as CSSProperties}>
            <Link
              to={postPath(post) as any}
              className={`group -mx-2 flex flex-col rounded px-2 py-2 transition-colors hover:bg-site-card-hover md:grid md:grid-cols-[6.5rem_minmax(0,1fr)_7.5rem_3.5rem] md:items-baseline md:gap-x-4 md:py-1 ${focusRing}`}
            >
              <time
                dateTime={post.published_time.toISOString()}
                className="hidden text-site-datetime md:block"
              >
                {isoDate(post.published_time)}
              </time>
              <span className="min-w-0">
                <span className="font-semibold group-hover:text-site-heading md:block md:truncate">
                  <Highlight text={post.title} query={query} />
                </span>
                {detailed && (
                  <span className="mt-0.5 line-clamp-2 text-site-muted md:line-clamp-1">
                    {post.description}
                  </span>
                )}
              </span>
              <span className="text-site-muted md:hidden">
                {isoDate(post.published_time)}
                <span className="hidden sm:inline"> · {category?.id}</span> · {minutes(post)}
              </span>
              <span className="hidden truncate text-site-muted md:block">{category?.id}</span>
              <span className="hidden text-right text-site-muted md:block">{minutes(post)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ToolRows({ items, query = "" }: { items: Tool[]; query?: string }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 md:grid-cols-3">
      {items.map((tool, index) => (
        <li
          key={tool.id}
          data-tool-row
          data-reveal-row
          className="min-w-0"
          style={
            {
              "--vt": `tool-${tool.id}`,
              "--tool-row-desktop": String(Math.floor(index / 3)),
              "--tool-row-mobile": String(Math.floor(index / 2)),
            } as CSSProperties
          }
        >
          <a
            href={tool.url}
            rel="external nofollow"
            className={`group -mx-2 flex min-w-0 items-baseline gap-2 rounded px-2 py-2 transition-colors hover:bg-site-card-hover md:py-1 ${focusRing}`}
          >
            <Icon name={tool.icon} className="shrink-0 translate-y-0.5 text-base" />
            <span className="truncate font-semibold group-hover:text-site-heading">
              <Highlight text={tool.title} query={query} />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export const linkClass = `rounded text-site-link underline-offset-4 hover:text-site-link-hover hover:underline ${focusRing}`;

export function MoreLink({
  onClick,
  children,
  row = 0,
}: {
  onClick: () => void;
  children: ReactNode;
  row?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-reveal-row
      style={{ "--row": String(row) } as CSSProperties}
      className={`mt-1 ${linkClass}`}
    >
      {children}
    </button>
  );
}

let transitionCounter = 0;

/**
 * Same-document view transition with calm easing (see globals.css) and without the page-level
 * slide. `kind` switches on the matching view-transition names only for the duration.
 */
export function calmTransition(kind: "window", update: () => void) {
  const root = document.documentElement;
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches)
    return update();
  const id = ++transitionCounter;
  root.dataset.searchTransition = "";
  root.dataset.calmTransition = kind;
  const done = () => {
    if (id !== transitionCounter) return;
    delete root.dataset.searchTransition;
    delete root.dataset.calmTransition;
  };
  try {
    document.startViewTransition(() => flushSync(update)).finished.then(done, done);
  } catch {
    done();
    update();
  }
}
