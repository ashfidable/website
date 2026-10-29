import { createFileRoute, notFound } from "@tanstack/react-router";
import { TerminalPost } from "@/components/terminal/post";
import { getPost, loadPost } from "$content/index";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/snippets/$slug")({
  loader: async ({ params }) => {
    if (!(await loadPost("snippets", params.slug))) throw notFound();
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
          modified: post.last_modified_time,
          tags: post.tags,
          image: `/images/og/snippets/${post.slug}.png`,
          imageAlt: post.social_image_alt,
        })
      : {};
  },
  component: SnippetPost,
});
function SnippetPost() {
  const { slug } = Route.useParams();
  return <TerminalPost key={slug} post={getPost("snippets", slug)!} />;
}
