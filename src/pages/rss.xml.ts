import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection, type CollectionEntry } from 'astro:content'

export async function GET(context: APIContext) {
	const posts = await getCollection('blog')
	const snippets = await getCollection('snippets')

	return rss({
		// `<title>` field in output xml
		title: "Ashfid's Blog",
		// `<description>` field in output xml
		description:
			'Digital Garden of Ashfid. Writing my thoughts, sharing dev secrets to simplify your coding life!',
		// Pull in your project "site" from the endpoint context
		// https://docs.astro.build/en/reference/api-reference/#contextsite
		site: context.site ?? 'localhost:4321',
		// Array of `<item>`s in output xml
		// See "Generating items" section for examples using content collections and glob imports
		items: [
			...posts.map((post) => ({
				title: post.data.title,
				description: post.data.description,
				tags: post.data.tags.join(', '),
				link: `/blog/${post.slug}`,
				pubDate: post.data.published_time
			})),
			...snippets.map((snippet) => ({
				title: snippet.data.title,
				description: snippet.data.description,
				tags: snippet.data.tags.join(', '),
				link: `/blog/${snippet.slug}`,
				pubDate: snippet.data.published_time
			}))
		],
		// (optional) inject custom xml
		customData: `<language>en-us</language>`
	})
}
