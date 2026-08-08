import { createFileRoute, notFound } from "@tanstack/react-router";
import { PostPage } from "@/components/post-page";
import { getPost } from "$content/index";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/snippets/$slug")({
  loader: ({ params }) => {
    if (!getPost("snippets", params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const post = getPost("snippets", params.slug);
    return post
      ? seo({
          title: post.title,
          description: post.description,
          path: `/snippets/${post.slug}`,
          type: "article",
          published: post.published_time,
          tags: post.tags,
        })
      : {};
  },
  component: SnippetPost,
});
function SnippetPost() {
  const { slug } = Route.useParams();
  return <PostPage post={getPost("snippets", slug)!} />;
}
