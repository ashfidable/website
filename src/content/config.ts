import { z, defineCollection, reference } from 'astro:content'

const snippetCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		url: z.string(),
		categories: z.array(reference('categories')),
		tags: z.array(z.string())
	})
})

const categoryCollection = defineCollection({
	type: 'data',
	schema: z.object({
		name: z.string(),
		icon: z.string().optional()
	})
})

export const collections = {
	snippets: snippetCollection,
	categories: categoryCollection
}
