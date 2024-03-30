import { getCollection } from 'astro:content'

const snippets = await getCollection('snippets')
const formatSnippets = snippets.map((snippet) => {
	return {
		title: snippet.data.title,
		url: `/snippets/${snippet.slug}`
	}
})

export async function GET({ params, request }) {
	return new Response(JSON.stringify(snippets))
}
