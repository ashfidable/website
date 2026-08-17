import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const postLikes = sqliteTable("post_likes", {
  postKey: text("post_key").primaryKey(),
  count: integer("like_count").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
