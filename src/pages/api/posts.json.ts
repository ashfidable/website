import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

const snippets = await getCollection('snippets')
const formatSnippets = snippets.map((snippet) => {
	return {
		title: snippet.data.title,
		url: `/snippets/${snippet.slug}`,
		description: snippet.data.description,
		slug: snippet.slug
	}
})

export const GET: APIRoute = async ({ params, request }) => {
	return new Response(JSON.stringify(formatSnippets))
}
