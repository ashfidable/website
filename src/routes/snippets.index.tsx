import { createFileRoute } from '@tanstack/react-router'
import { SnippetCard } from '@/components/cards'
import { HeroSection } from '@/components/site'
import { snippets } from '$content/index'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/snippets/')({ head: () => seo({ title: 'Snippets', description: 'Useful snippets that I use a lot or found really helpful on Internet.', path: '/snippets' }), component: SnippetIndex })

function SnippetIndex() {
  const groups = [...snippets].sort((a, b) => a.published_time.getTime() - b.published_time.getTime()).reduce<Record<string, typeof snippets>>((result, post) => { const year = String(post.published_time.getFullYear()); (result[year] ??= []).push(post); return result }, {})
  return <><HeroSection title="Snippets 📒"><p className="font-bold">Useful snippets that I use a lot or found really helpful on Internet.</p><p>So far, I have posted <strong>{snippets.length}</strong> {snippets.length === 1 ? 'snippet' : 'snippets'}.</p></HeroSection>{Object.keys(groups).reverse().map((year) => <section key={year} className="flex flex-col gap-4"><h2 className="font-site-heading text-xl font-bold">{year}</h2><div>{groups[year]?.map((snippet) => <SnippetCard key={snippet.id} snippet={snippet} />)}</div></section>)}</>
}
