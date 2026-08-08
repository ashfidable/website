declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { MDXComponents } from 'mdx/types'

  export const frontmatter: Record<string, unknown>
  export const source: string
  const MDXContent: ComponentType<{ components?: MDXComponents }>
  export default MDXContent
}
