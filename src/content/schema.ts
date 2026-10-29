import { z } from "zod";

const iconLinkSchema = z.object({ name: z.string(), url: z.string(), icon: z.string() });
const siteSchema = z.object({
  name: z.string(),
  title: z.string(),
  url: z.string().url(),
  description: z.string(),
  discordId: z.string(),
  supportUrl: z.string().url(),
});
const terminalSchema = z.object({ user: z.string(), host: z.string() });
const categorySchema = z.object({ id: z.string(), name: z.string(), icon: z.string() });
const toolSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
  url: z.string().url(),
  icon: z.string(),
});
const skillSchema = z.object({
  id: z.string(),
  title: z.string(),
  entries: z.array(z.object({ name: z.string(), icon: z.string() })),
});
export const configSchema = z.object({
  site: siteSchema,
  terminal: terminalSchema,
  socialLinks: z.array(iconLinkSchema),
  categories: z.array(categorySchema),
  tools: z.array(toolSchema),
  skills: z.array(skillSchema),
});
const reviewSchema = z.object({
  rating: z.number().min(0).max(5),
  platform: z.string(),
  playtime_hours: z.number().positive(),
  status: z.string(),
});
export const postSchema = z
  .object({
    title: z.string().max(60),
    description: z.string().max(160),
    url: z.string().optional(),
    published_time: z.coerce.date(),
    last_modified_time: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()),
    social_image: z.string().optional(),
    social_image_alt: z.string().optional(),
    review: reviewSchema.optional(),
  })
  .superRefine((post, context) => {
    if (post.category === "game-review" && !post.review) {
      context.addIssue({
        code: "custom",
        path: ["review"],
        message: "Game reviews require rating, platform, playtime_hours, and status.",
      });
    }
  });

export type SiteConfig = z.infer<typeof configSchema>;
export type PostFrontmatter = z.infer<typeof postSchema>;
