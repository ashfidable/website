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
		published_time: z.date(),
		last_modified_time: z.date().optional(),
		url: z.string(),
		category: reference('categories'),
		tags: z.array(z.string())
	})
})

const blogCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().max(60),
		description: z.string().max(160),
		published_time: z.date(),
		last_modified_time: z.date().optional(),
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
	blog: blogCollection,
	snippets: snippetCollection,
	categories: categoryCollection,
	skills: skillCollection,
	tools: toolCollection
}
