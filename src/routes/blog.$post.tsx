import { createFileRoute, notFound } from "@tanstack/react-router";
import { TerminalPost } from "@/components/terminal/post";
import { getPost, loadPost } from "$content/index";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/blog/$post")({
  loader: async ({ params }) => {
    if (!(await loadPost("blog", params.post))) throw notFound();
    return { slug: params.post };
  },
  head: ({ params }) => {
    const post = getPost("blog", params.post);
    return post
      ? seo({
          title: post.title,
          description: post.description,
          path: `/blog/${post.slug}`,
          type: "article",
          published: post.published_time,
          modified: post.last_modified_time,
          tags: post.tags,
          image: `/images/og/blog/${post.slug}.png`,
          imageAlt: post.social_image_alt,
        })
      : {};
  },
  component: BlogPost,
});
function BlogPost() {
  const { post: slug } = Route.useParams();
  return <TerminalPost key={slug} post={getPost("blog", slug)!} />;
}
