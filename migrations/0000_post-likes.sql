CREATE TABLE `post_likes` (
	`post_key` text PRIMARY KEY NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
