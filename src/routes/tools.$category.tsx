import { createFileRoute, notFound } from '@tanstack/react-router'
import { ToolsPage, toolsTitle } from '@/components/tools-page'
import { categories } from '$content/index'
import { seo } from '@/lib/seo'
export const Route = createFileRoute('/tools/$category')({ loader: ({ params }) => { if (!categories.some((item) => item.id === params.category)) throw notFound(); return params.category }, head: ({ params }) => seo({ title: toolsTitle(params.category), description: `Explore the tools I use for ${params.category}.`, path: `/tools/${params.category}` }), component: ToolCategory })
function ToolCategory() { const { category } = Route.useParams(); return <ToolsPage category={category} /> }
