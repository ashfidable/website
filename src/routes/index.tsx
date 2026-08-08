import { createFileRoute } from '@tanstack/react-router'
import { BlogCard, SkillContainer, SnippetCard } from '@/components/cards'
import { HomeHeroSection, SectionHeading } from '@/components/site'
import { blogPosts, skills, snippets } from '$content/index'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/')({
  head: () => seo({ title: 'Home', description: 'I’m a Software Engineer and Programmer. This cozy corner is for sharing my thoughts, tutorials, and much more. Welcome to my digital garden.' }),
  component: Home,
})

function Home() {
  const sortedSkills = [...skills].sort((a, b) => b.entries.length - a.entries.length)
  return <><HomeHeroSection /><section id="latest-posts" className="space-y-4"><SectionHeading title="Latest Posts" /><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{blogPosts.map((post) => <BlogCard key={post.id} post={post} />)}</div></section><section id="latest-snippets" className="space-y-4"><SectionHeading title="Latest Snippets" /><div className="space-y-2 lg:space-y-4">{snippets.map((snippet) => <SnippetCard key={snippet.id} as="h3" snippet={snippet} />)}</div></section><section id="things-i-know" className="space-y-4"><SectionHeading title="Things I know" />{sortedSkills.map((skill) => <SkillContainer key={skill.id} skill={skill} />)}</section></>
}
