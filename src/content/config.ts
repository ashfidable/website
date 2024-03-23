import { z, defineCollection, reference } from 'astro:content'

const toolCollection = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		categories: z.array(reference('categories')),
		url: z.string().url(),
		icon: z.string().optional()
	})
})

const snippetCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		published: z.date(),
		url: z.string(),
		category: reference('categories'),
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

const skillCollection = defineCollection({
	type: 'data',
	schema: z.object({
		entries: z.array(
			z.object({
				name: z.string(),
				icon: z.string().optional()
			})
		)
	})
})

export const collections = {
	snippets: snippetCollection,
	categories: categoryCollection,
	skills: skillCollection,
	tools: toolCollection
}
