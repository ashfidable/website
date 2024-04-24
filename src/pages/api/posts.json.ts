import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

const snippets = await getCollection('snippets')
const blog = await getCollection('blog')
const formatSnippets = snippets.map((snippet) => {
	return {
		title: snippet.data.title,
		url: `/snippets/${snippet.slug}`,
		description: snippet.data.description,
		slug: snippet.slug
	}
})

const formatPosts = blog.map((post) => {
	return {
		title: post.data.title,
		url: `/blog/${post.slug}`,
		description: post.data.description,
		slug: post.slug
	}
})

const all = [...formatPosts, ...formatSnippets]

export const GET: APIRoute = async ({ params, request }) => {
	return new Response(JSON.stringify(all))
}
