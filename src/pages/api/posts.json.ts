import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import fs from 'node:fs'

const snippets = await getCollection('snippets')
const formatSnippets = snippets.map((snippet) => {
	return {
		title: snippet.data.title,
		url: `/snippets/${snippet.slug}`
	}
})

export const GET: APIRoute = async ({ params, request }) => {
	fs.writeFile('commands.json', JSON.stringify(snippets), () => console.log('Saved'))
	return new Response(JSON.stringify(snippets))
}
