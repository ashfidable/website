import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/robots.txt')({ server: { handlers: { GET: () => new Response('User-agent: *\nAllow: /\n\nSitemap: https://ashfid.dev/sitemap-index.xml', { headers: { 'content-type': 'text/plain; charset=utf-8' } }) } } } as any)
