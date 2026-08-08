import type { ComponentType } from 'react'
import type { MDXComponents } from 'mdx/types'
import { parse } from 'yaml'
import { z } from 'zod'

const categorySchema = z.object({ name: z.string(), icon: z.string().optional() })
const toolSchema = z.object({
  title: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
  url: z.string().url(),
  icon: z.string().optional(),
})
const skillSchema = z.object({
  entries: z.array(z.object({ name: z.string(), icon: z.string().optional() })),
})
const postSchema = z.object({
  title: z.string().max(60),
  description: z.string().max(160),
  url: z.string().optional(),
  published_time: z.coerce.date(),
  last_modified_time: z.coerce.date().optional(),
  category: z.string(),
  tags: z.array(z.string()),
})

type MdxModule = {
  default: ComponentType<{ components?: MDXComponents }>
  frontmatter: Record<string, unknown>
  source: string
}

export type Category = z.infer<typeof categorySchema> & { id: string }
export type Tool = z.infer<typeof toolSchema> & { id: string }
export type Skill = z.infer<typeof skillSchema> & { id: string }
export type Post = z.infer<typeof postSchema> & {
  id: string
  slug: string
  kind: 'blog' | 'snippets'
  body: string
  Content: MdxModule['default']
}

function idFromPath(path: string) {
  return path.split('/').at(-1)!.replace(/\.(yaml|mdx)$/, '')
}

function loadYaml<T>(modules: Record<string, unknown>, schema: z.ZodType<T>) {
  return Object.entries(modules).map(([path, source]) => ({
    id: idFromPath(path),
    ...schema.parse(parse(source as string)),
  }))
}

const categorySources = import.meta.glob('./categories/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
})
const toolSources = import.meta.glob('./tools/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
})
const skillSources = import.meta.glob('./skills/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
})
const postModules = import.meta.glob('./posts/**/*.mdx', { eager: true }) as Record<string, MdxModule>

export const categories = loadYaml(categorySources, categorySchema) as Category[]
export const tools = loadYaml(toolSources, toolSchema) as Tool[]
export const skills = loadYaml(skillSources, skillSchema) as Skill[]

export const posts: Post[] = Object.entries(postModules).map(([path, module]) => {
  const relative = path.replace('./posts/', '').replace(/\.mdx$/, '')
  const [kind, ...slugParts] = relative.split('/')
  if (kind !== 'blog' && kind !== 'snippets') throw new Error(`Unknown post kind: ${kind}`)

  return {
    id: relative,
    slug: slugParts.join('/'),
    kind,
    body: module.source,
    Content: module.default,
    ...postSchema.parse(module.frontmatter),
  }
})

export const blogPosts = posts.filter((post) => post.kind === 'blog')
export const snippets = posts.filter((post) => post.kind === 'snippets')

export function getCategory(id: string) {
  return categories.find((category) => category.id === id)
}

export function getPost(kind: Post['kind'], slug: string) {
  return posts.find((post) => post.kind === kind && post.slug === slug)
}

export function postPath(post: Post) {
  return `/${post.kind}/${post.slug}`
}
