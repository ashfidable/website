import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { Icon } from './icon'

function headingAnchor(id: string | undefined, children: ReactNode) {
  return <a href={`#${id}`}>{children}</a>
}

export function PostImage({ src = '', alt = '' }: { src?: string; alt?: string }) {
  return (
    <figure className="mx-auto mb-4 w-full overflow-hidden rounded-md border border-b-4 border-site-border md:w-1/2">
      <img src={src} alt={alt} width={640} height={360} loading="lazy" className="h-auto w-full object-cover" />
      <figcaption className="flex justify-center bg-site-card p-2 text-sm text-site-muted">{alt}</figcaption>
    </figure>
  )
}

export const mdxComponents: MDXComponents = {
  h1: ({ children, ...props }) => <h1 {...props} className="group scroll-mt-16 border-b border-site-border font-site-heading text-2xl font-bold text-site-heading hover:text-site-heading-hover">{headingAnchor(props.id, children)}<span className="opacity-0 transition-opacity duration-75 group-hover:opacity-100"> #</span></h1>,
  h2: ({ children, ...props }) => <h2 {...props} className="group mb-4 mt-8 flex snap-start scroll-mt-16 items-center gap-2 border-b border-site-border-hover pb-1 font-site-heading text-xl font-bold hover:text-site-heading-hover">{headingAnchor(props.id, children)}<Icon name="ri:link" className="inline-block opacity-0 transition-opacity duration-75 group-hover:opacity-100" /></h2>,
  h3: ({ children, ...props }) => <h3 {...props} className="group mb-2 mt-6 flex scroll-mt-16 items-center gap-2 font-site-heading text-xl font-bold hover:text-site-heading-hover">{headingAnchor(props.id, children)}<Icon name="ri:link" className="inline-block opacity-0 transition-opacity duration-75 group-hover:opacity-100" /></h3>,
  h4: ({ children, ...props }) => <h4 {...props} className="group my-4 flex scroll-mt-16 items-center gap-2 font-site-heading text-base font-bold text-site-heading hover:text-site-heading-hover">{headingAnchor(props.id, children)}<Icon name="ri:link" className="inline-block opacity-0 transition-opacity duration-75 group-hover:opacity-100" /></h4>,
  p: (props) => <p {...props} className="mb-2 [text-wrap:balance]" />,
  a: (props) => <a {...props} className="font-bold underline decoration-site-link decoration-4 underline-offset-4 hover:decoration-site-link-hover" />,
  blockquote: (props) => <blockquote {...props} className="mb-4 mt-8 overflow-hidden rounded-md border-l-4 border-site-blockquote-border bg-site-blockquote p-2 font-normal italic tracking-wider text-site-blockquote-foreground [&>p]:mb-0" />,
  ol: (props) => <ol {...props} className="mb-2 ml-2 list-inside list-decimal space-y-2 marker:text-site-heading md:ml-4" />,
  ul: (props) => <ul {...props} className="mb-2 ml-2 list-inside list-disc space-y-2 marker:text-site-heading md:ml-4" />,
  img: (props) => <PostImage src={typeof props.src === 'string' ? props.src : undefined} alt={props.alt} />,
}

export type Heading = { depth: number; slug: string; text: string }

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/<[^>]*>|[`*_~]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export function extractHeadings(source: string): Heading[] {
  return source.split(/\r?\n/).flatMap((line) => {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim())
    if (!match) return []
    const text = match[2].replace(/\[([^\]]+)]\([^)]*\)/g, '$1').replace(/[*_`]/g, '')
    return [{ depth: match[1].length, slug: slugify(text), text }]
  })
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  return (
    <section className="sticky top-0 z-30 h-12">
      <details className="group border-y border-site-border bg-site-surface p-4 pb-2 open:border-b open:font-bold">
        <summary className="cursor-pointer pb-2 font-semibold decoration-site-link decoration-4 marker:text-site-heading group-open:underline">Table Of Contents</summary>
        <ul className="ml-2 flex max-h-72 list-inside list-disc flex-col gap-2 overflow-y-auto p-4 pt-0 font-normal marker:text-site-heading">
          {headings.map((heading) => <li key={heading.slug} className={heading.depth === 3 ? 'ml-4' : heading.depth === 2 ? 'font-bold' : ''}><a href={`#${heading.slug}`} onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}>{heading.text}</a></li>)}
        </ul>
      </details>
    </section>
  )
}
