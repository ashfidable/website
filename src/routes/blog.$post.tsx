import { createFileRoute, notFound } from "@tanstack/react-router";
import { PostPage } from "@/components/post-page";
import { getPost } from "$content/index";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/blog/$post")({
  loader: ({ params }) => {
    if (!getPost("blog", params.post)) throw notFound();
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
          tags: post.tags,
        })
      : {};
  },
  component: BlogPost,
});
function BlogPost() {
  const { post: slug } = Route.useParams();
  return <PostPage post={getPost("blog", slug)!} />;
}
