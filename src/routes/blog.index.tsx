import { createFileRoute } from "@tanstack/react-router";
import { BlogCard } from "@/components/cards";
import { PostSearchList } from "@/components/post-search-list";
import { HeroSection } from "@/components/site";
import { blogPosts } from "$content/index";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () => seo({ title: "Blog", description: "Posts written by Me.", path: "/blog" }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <>
      <HeroSection title="Blog 📙">
        <p className="font-bold">
          This is where I write my thoughts, tutorials, break down mechanics--and much more.
        </p>
        <p>
          I have written <strong>{blogPosts.length}</strong>{" "}
          {blogPosts.length === 1 ? "article" : "articles"} so far.
        </p>
      </HeroSection>
      <PostSearchList
        posts={blogPosts}
        noun="article"
        renderPost={(post) => <BlogCard post={post} />}
      />
    </>
  );
}
