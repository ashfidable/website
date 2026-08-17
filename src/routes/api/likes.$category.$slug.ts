import { createFileRoute } from "@tanstack/react-router";
import { addPostLikes, getPostLikes, postLikeBatchSchema } from "@/features/post-likes/post-likes";

export const Route = createFileRoute("/api/likes/$category/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) =>
        Response.json(
          await getPostLikes({ data: { postKey: `${params.category}:${params.slug}` } }),
        ),
      POST: async ({ params, request }) => {
        const batch = postLikeBatchSchema.safeParse(await request.json().catch(() => null));
        if (!batch.success) {
          return Response.json({ error: "Invalid like batch" }, { status: 400 });
        }

        const total = await addPostLikes({
          data: {
            postKey: `${params.category}:${params.slug}`,
            amount: batch.data.amount,
          },
        });
        if (total === null) {
          return Response.json(
            { error: "Too many likes" },
            { status: 429, headers: { "Retry-After": "60" } },
          );
        }

        return Response.json(total);
      },
    },
  },
});
