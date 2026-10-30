import { type ComponentProps, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { MDXComponents } from "mdx/types";
import { Icon } from "./icon";
import { isExternalLink } from "./link-preview";
import { focusRing } from "./terminal/data";
import { linkClass } from "./terminal/ui";

/** Tallest an image gets in the reading column, so portrait shots don't fill the viewport. */
const MAX_IMAGE_HEIGHT = 448;

/** Markdown headings keep their `##` so posts read like the source the terminal is `cat`-ing. */
function PostHeading({
  as: Tag,
  marker,
  id,
  className,
  children,
}: {
  as: "h1" | "h2" | "h3" | "h4";
  marker: string;
  id?: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <Tag id={id} className={`scroll-mt-4 font-bold ${className}`}>
      <a href={`#${id}`} className={`rounded hover:text-site-heading-hover ${focusRing}`}>
        <span aria-hidden="true" className="font-normal text-site-muted">
          {marker}{" "}
        </span>
        {children}
      </a>
    </Tag>
  );
}

export function PostImage({
  src = "",
  alt = "",
  width = 640,
  height = 360,
}: {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure
      className="mb-5 mt-5"
      style={{ width: `min(100%, ${width}px, ${(MAX_IMAGE_HEIGHT * width) / height}px)` }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className="h-auto w-full rounded-md border border-site-border"
      />
      <figcaption className="mt-1 text-xs text-site-muted"># {alt}</figcaption>
    </figure>
  );
}

function PostLink({ children, ...props }: ComponentProps<"a">) {
  const className = `underline decoration-site-link/40 hover:decoration-site-link-hover ${linkClass}`;
  if (props.href?.startsWith("/") && !props.href.startsWith("//") && !props.download) {
    const { href, ...linkProps } = props;
    return (
      <Link {...linkProps} to={href} className={className}>
        {children}
      </Link>
    );
  }
  const external = isExternalLink(props.href);
  // Nowrap the end of the text so the icon can't drop to a line of its own, without
  // stopping a long URL from wrapping.
  const tail = external && typeof children === "string" ? children.search(/\S{1,20}$/) : -1;
  const lead = tail < 0 ? children : (children as string).slice(0, tail);
  return (
    <a
      {...props}
      {...(external && {
        target: "_blank",
        rel: "noopener noreferrer",
        "data-external-link": "",
      })}
      className={className}
    >
      {lead}
      {external && (
        <>
          <span className="whitespace-nowrap">
            {tail >= 0 && (children as string).slice(tail)}
            <Icon
              name="ri:external-link-line"
              className="ml-0.5 inline align-[-0.1em] text-[0.85em]"
            />
          </span>
          <span className="sr-only"> (external link, opens in a new tab)</span>
        </>
      )}
    </a>
  );
}

export const mdxComponents: MDXComponents = {
  h1: ({ children, id }) => (
    <PostHeading as="h1" marker="#" id={id} className="mb-3 mt-12 text-xl text-site-heading">
      {children}
    </PostHeading>
  ),
  h2: ({ children, id }) => (
    <PostHeading
      as="h2"
      marker="##"
      id={id}
      className="mb-4 mt-12 border-b border-site-border pb-2 text-lg text-site-heading"
    >
      {children}
    </PostHeading>
  ),
  h3: ({ children, id }) => (
    <PostHeading as="h3" marker="###" id={id} className="mb-2 mt-8 text-base text-site-heading">
      {children}
    </PostHeading>
  ),
  h4: ({ children, id }) => (
    <PostHeading as="h4" marker="####" id={id} className="mb-2 mt-6">
      {children}
    </PostHeading>
  ),
  p: (props) => <p {...props} className="mb-5" />,
  strong: (props) => <strong {...props} className="font-bold text-site-heading" />,
  a: PostLink,
  blockquote: (props) => (
    <blockquote
      {...props}
      className="mb-4 mt-4 border-l-2 border-site-blockquote-border pl-3 text-site-muted [&>p:last-child]:mb-0"
    />
  ),
  ol: (props) => (
    <ol {...props} className="mb-4 list-decimal space-y-1 pl-6 marker:text-site-muted" />
  ),
  ul: (props) => (
    <ul {...props} className="mb-4 list-['-_'] space-y-1 pl-4 marker:text-site-muted" />
  ),
  img: (props) => (
    <PostImage src={typeof props.src === "string" ? props.src : undefined} alt={props.alt} />
  ),
};
