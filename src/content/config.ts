import { z, defineCollection } from "astro:content";

const snippetCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        url: z.string(),
        category: z.string(),
        tags: z.array(z.string()),
    })
})

export const collections = {
    'snippets': snippetCollection
}