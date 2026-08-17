import { env } from "cloudflare:workers";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { postLikes } from "@/db/schema";

const postKeySchema = z.object({
  postKey: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

const postLikeSchema = postKeySchema.extend({
  amount: z.number().int().min(1).max(5),
});

export const getPostLikes = createServerFn({ method: "GET" })
  .validator(postKeySchema)
  .handler(async ({ data }) => {
    const row = await drizzle(env.DB)
      .select({ count: postLikes.count })
      .from(postLikes)
      .where(eq(postLikes.postKey, data.postKey))
      .get();

    return row?.count ?? 0;
  });

export const addPostLikes = createServerFn({ method: "POST" })
  .validator(postLikeSchema)
  .handler(async ({ data }) => {
    const ip = getRequestHeader("cf-connecting-ip") ?? "local";
    const key = `${ip}:${data.postKey}`;

    // A batch spends one rate-limit token per like, not per HTTP request.
    for (let like = 0; like < data.amount; like += 1) {
      const { success } = await env.LIKE_RATE_LIMITER.limit({ key });
      if (!success) return null;
    }

    // Let SQLite increment the count so concurrent batches cannot overwrite each other.
    const [row] = await drizzle(env.DB)
      .insert(postLikes)
      .values({
        postKey: data.postKey,
        count: data.amount,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: postLikes.postKey,
        set: {
          count: sql`${postLikes.count} + ${data.amount}`,
          updatedAt: new Date(),
        },
      })
      .returning({ count: postLikes.count });

    return row.count;
  });
