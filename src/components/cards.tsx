import { Link } from '@tanstack/react-router'
import type { ElementType } from 'react'
import type { Post, Skill, Tool } from '$content/index'
import { getCategory, postPath } from '$content/index'
import { formatDate } from '$utils/date-formatter'
import { getReadingTime } from '$utils/reading-time'
import { convertToTitleCase } from '$utils/string-formatter'
import { Icon } from './icon'

function transitionName(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }

export function BlogCard({ post }: { post: Post }) {
  const category = getCategory(post.category)
  return (
    <Link to={postPath(post) as any} data-type={category?.name.toLowerCase()} className="group flex h-full flex-col justify-between gap-4 overflow-hidden rounded-md border border-b-4 border-site-border bg-site-card p-4 pb-2 transition-colors duration-150 ease-in-out hover:border-b-site-category-border hover:bg-site-card-hover">
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-2" style={{ viewTransitionName: transitionName(post.title) }}>
          <span className="inline-flex self-start rounded-md bg-site-category p-2 text-lg font-bold tracking-wide opacity-90"><Icon name={category?.icon} className="text-site-icon" /></span>
          <h2 className="font-site-heading font-semibold tracking-wider">{post.title}</h2>
        </div>
      </div>
      <div className="mt-auto space-y-2">
        <p className="text-site-muted">{post.description}</p>
        <div className="flex justify-between border-t border-site-border pt-2 font-mono text-sm">
          <time className="text-site-datetime">{formatDate(post.published_time)}</time>
          <span>{getReadingTime(post.body)}</span>
        </div>
      </div>
    </Link>
  )
}

export function SnippetCard({ snippet, as: Heading = 'h4' }: { snippet: Post; as?: ElementType }) {
  const category = getCategory(snippet.category)
  return (
    <Link to={postPath(snippet) as any} data-type={category?.name.toLowerCase()} className="group flex items-center justify-between gap-4 rounded-md border-x border-b-2 border-t border-site-border bg-site-card p-4 transition-colors duration-150 hover:border-b-site-category-border hover:bg-site-card-hover" style={{ viewTransitionName: transitionName(snippet.title) }}>
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-site-category p-1"><Icon name={category?.icon} className="text-site-category-foreground group-hover:animate-bounce" /></div>
        <Heading className="font-site-heading text-base font-semibold tracking-wider">{snippet.title}</Heading>
      </div>
      <span className="hidden font-mono text-site-datetime md:block">{formatDate(snippet.published_time)}</span>
    </Link>
  )
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <a href={tool.url} className="cursor-pointer rounded-md border-x border-b-2 border-t border-site-border bg-site-card p-2 hover:border-site-border-hover" rel="external nofollow" style={{ viewTransitionName: transitionName(tool.title) }}>
      <div className="flex items-center gap-4"><div className="flex h-4 w-4 items-center"><Icon name={tool.icon} className="text-base" /></div><h4 className="font-site-heading font-bold tracking-wide">{tool.title}</h4></div>
    </a>
  )
}

export function SkillContainer({ skill }: { skill: Skill }) {
  return (
    <div className="flex flex-col gap-2 md:items-start">
      <h3 className="font-site-heading text-xl font-semibold text-site-heading">{convertToTitleCase(skill.id)}</h3>
      <div className="flex flex-wrap gap-2">
        {[...skill.entries].sort((a, b) => a.name.localeCompare(b.name)).map((entry) => (
          <div key={entry.name} className="group relative inline-block rounded-md bg-site-card p-4">
            <span className="pointer-events-none absolute inset-x-0 top-0 inline-block w-max -translate-y-12 scale-0 rounded-md border border-site-border bg-site-card p-2 font-bold opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">{entry.name}</span>
            <Icon name={entry.icon} className="text-3xl opacity-50 transition-all duration-150 group-hover:scale-110 group-hover:text-site-icon-hover group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
