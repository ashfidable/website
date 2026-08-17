import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import type { MDXComponents } from "mdx/types";
import { Icon } from "./icon";

function headingAnchor(id: string | undefined, children: ReactNode) {
  return <a href={`#${id}`}>{children}</a>;
}

export function PostImage({ src = "", alt = "" }: { src?: string; alt?: string }) {
  return (
    <figure className="mx-auto mb-4 w-full overflow-hidden rounded-md border border-b-4 border-site-border md:w-1/2">
      <img
        src={src}
        alt={alt}
        width={640}
        height={360}
        loading="lazy"
        className="h-auto w-full object-cover"
      />
      <figcaption className="flex justify-center bg-site-card p-2 text-sm text-site-muted">
        {alt}
      </figcaption>
    </figure>
  );
}

export const mdxComponents: MDXComponents = {
  h1: ({ children, ...props }) => (
    <h1
      {...props}
      className="group scroll-mt-16 border-b border-site-border font-site-heading text-2xl font-bold text-site-heading hover:text-site-heading-hover"
    >
      {headingAnchor(props.id, children)}
      <span className="opacity-0 transition-opacity duration-75 group-hover:opacity-100"> #</span>
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="group mb-4 mt-8 flex snap-start scroll-mt-16 items-center gap-2 border-b border-site-border-hover pb-1 font-site-heading text-xl font-bold hover:text-site-heading-hover"
    >
      {headingAnchor(props.id, children)}
      <Icon
        name="ri:link"
        className="inline-block opacity-0 transition-opacity duration-75 group-hover:opacity-100"
      />
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      className="group mb-2 mt-6 flex scroll-mt-16 items-center gap-2 font-site-heading text-xl font-bold hover:text-site-heading-hover"
    >
      {headingAnchor(props.id, children)}
      <Icon
        name="ri:link"
        className="inline-block opacity-0 transition-opacity duration-75 group-hover:opacity-100"
      />
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      {...props}
      className="group my-4 flex scroll-mt-16 items-center gap-2 font-site-heading text-base font-bold text-site-heading hover:text-site-heading-hover"
    >
      {headingAnchor(props.id, children)}
      <Icon
        name="ri:link"
        className="inline-block opacity-0 transition-opacity duration-75 group-hover:opacity-100"
      />
    </h4>
  ),
  p: (props) => <p {...props} className="mb-2" />,
  a: (props) => (
    <a
      {...props}
      className="font-bold underline decoration-site-link decoration-4 underline-offset-4 hover:decoration-site-link-hover"
    />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="mb-4 mt-8 overflow-hidden rounded-md border-l-4 border-site-blockquote-border bg-site-blockquote p-2 font-normal italic tracking-wider text-site-blockquote-foreground [&>p]:mb-0"
    />
  ),
  ol: (props) => (
    <ol
      {...props}
      className="mb-2 ml-2 list-inside list-decimal space-y-2 marker:text-site-heading md:ml-4"
    />
  ),
  ul: (props) => (
    <ul
      {...props}
      className="mb-2 ml-2 list-inside list-disc space-y-2 marker:text-site-heading md:ml-4"
    />
  ),
  img: (props) => (
    <PostImage src={typeof props.src === "string" ? props.src : undefined} alt={props.alt} />
  ),
};

export type Heading = { depth: number; slug: string; text: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>|[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractHeadings(source: string): Heading[] {
  return source.split(/\r?\n/).flatMap((line) => {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!match) return [];
    const text = match[2].replace(/\[([^\]]+)]\([^)]*\)/g, "$1").replace(/[*_`]/g, "");
    return [{ depth: match[1].length, slug: slugify(text), text }];
  });
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeSlug, setActiveSlug] = useState(headings[0]?.slug ?? "");
  const selectedHeading = useRef<string | null>(null);

  useEffect(() => {
    let frame = 0;

    const updateActiveHeading = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (selectedHeading.current) {
          setActiveSlug(selectedHeading.current);
          return;
        }

        const readingLine = window.scrollY + Math.min(window.innerHeight * 0.28, 220);
        let current = headings[0]?.slug ?? "";

        for (const heading of headings) {
          const element = document.getElementById(heading.slug);
          if (!element) continue;
          const top = element.getBoundingClientRect().top + window.scrollY;
          if (top > readingLine) break;
          current = heading.slug;
        }

        setActiveSlug(current);
      });
    };

    const clearSelectedHeading = () => {
      selectedHeading.current = null;
    };
    const clearSelectedHeadingWithKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "].includes(event.key)) {
        clearSelectedHeading();
      }
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);
    window.addEventListener("wheel", clearSelectedHeading, { passive: true });
    window.addEventListener("touchmove", clearSelectedHeading, { passive: true });
    window.addEventListener("keydown", clearSelectedHeadingWithKey);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
      window.removeEventListener("wheel", clearSelectedHeading);
      window.removeEventListener("touchmove", clearSelectedHeading);
      window.removeEventListener("keydown", clearSelectedHeadingWithKey);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="sticky top-2 z-30 mb-8">
      <details className="group overflow-hidden rounded-md border border-site-border bg-site-surface/95 shadow-sm backdrop-blur-md">
        <summary className="flex h-11 cursor-pointer list-none items-center gap-2 px-3 text-sm font-medium text-site-muted outline-none transition-colors hover:text-site-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-site-ring [&::-webkit-details-marker]:hidden">
          <Icon name="mdi:format-list-bulleted" className="text-base text-site-icon-hover" />
          <span>On this page</span>
          <span className="ml-auto font-mono text-[0.7rem] tabular-nums text-site-muted">
            {headings.length} {headings.length === 1 ? "section" : "sections"}
          </span>
          <Icon
            name="mdi:chevron-down"
            className="text-base transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <ol className="max-h-72 overflow-y-auto border-t border-site-border p-2">
          {headings.map((heading) => {
            const active = heading.slug === activeSlug;
            return (
              <li
                key={heading.slug}
                className={heading.depth === 4 ? "ml-8" : heading.depth === 3 ? "ml-4" : ""}
              >
                <a
                  href={`#${heading.slug}`}
                  aria-current={active ? "location" : undefined}
                  className={`flex items-baseline gap-2 rounded px-2 py-1.5 text-sm outline-none transition-colors ${active ? "bg-site-button-active font-semibold text-site-heading" : "text-site-muted hover:bg-site-card-hover hover:text-site-foreground focus-visible:bg-site-card-hover focus-visible:text-site-foreground"}`}
                  onClick={(event) => {
                    event.preventDefault();
                    selectedHeading.current = heading.slug;
                    setActiveSlug(heading.slug);
                    event.currentTarget.closest("details")?.removeAttribute("open");
                    document.getElementById(heading.slug)?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span
                    className={`h-1 w-1 shrink-0 rounded-full transition-[background-color,transform] ${active ? "scale-150 bg-site-icon-hover" : "bg-site-border-hover"}`}
                  />
                  <span>{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </details>
    </nav>
  );
}
