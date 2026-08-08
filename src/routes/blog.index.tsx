import { createFileRoute } from '@tanstack/react-router'
import { BlogCard } from '@/components/cards'
import { HeroSection } from '@/components/site'
import { blogPosts } from '$content/index'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/blog/')({ head: () => seo({ title: 'Blog', description: 'Posts written by Me.', path: '/blog' }), component: BlogIndex })

function BlogIndex() {
  const groups = [...blogPosts].sort((a, b) => a.published_time.getTime() - b.published_time.getTime()).reduce<Record<string, typeof blogPosts>>((result, post) => { const year = String(post.published_time.getFullYear()); (result[year] ??= []).push(post); return result }, {})
  return <><HeroSection title="Blog 📙"><p className="font-bold">This is where I write my thoughts, tutorials, break down mechanics--and much more.</p><p>I have written <strong>{blogPosts.length}</strong> {blogPosts.length === 1 ? 'article' : 'articles'} so far.</p></HeroSection>{Object.keys(groups).reverse().map((year) => <section key={year} className="flex flex-col gap-4"><h2 className="font-site-heading text-xl font-bold">{year}</h2><ul>{groups[year]?.map((post) => <li key={post.id}><BlogCard post={post} /></li>)}</ul></section>)}</>
}
