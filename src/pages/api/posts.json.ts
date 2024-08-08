import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

const posts = await getCollection('posts')

const formatPosts = posts.map((post) => {
	return {
		title: post.data.title,
		url: post.slug,
		description: post.data.description,
		slug: post.slug
	}
})

export const GET: APIRoute = async ({ params, request }) => {
	return new Response(JSON.stringify(formatPosts))
}
