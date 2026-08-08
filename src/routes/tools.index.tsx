import { createFileRoute } from '@tanstack/react-router'
import { ToolsPage } from '@/components/tools-page'
import { seo } from '@/lib/seo'
export const Route = createFileRoute('/tools/')({ head: () => seo({ title: 'Tools', description: 'Explore the tools I use.', path: '/tools' }), component: () => <ToolsPage /> })
