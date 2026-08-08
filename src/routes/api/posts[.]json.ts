import { createFileRoute } from '@tanstack/react-router'
import { posts, postPath } from '$content/index'
export const Route = createFileRoute('/api/posts.json')({ server: { handlers: { GET: () => Response.json(posts.map((post) => ({ title: post.title, url: postPath(post), description: post.description, slug: post.slug }))) } } } as any)
