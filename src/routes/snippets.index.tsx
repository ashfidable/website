import { createFileRoute } from "@tanstack/react-router";
import { SnippetCard } from "@/components/cards";
import { PostSearchList } from "@/components/post-search-list";
import { HeroSection } from "@/components/site";
import { snippets } from "$content/index";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/snippets/")({
  head: () =>
    seo({
      title: "Snippets",
      description: "Useful snippets that I use a lot or found really helpful on Internet.",
      path: "/snippets",
    }),
  component: SnippetIndex,
});

function SnippetIndex() {
  return (
    <>
      <HeroSection title="Snippets 📒">
        <p className="font-bold">
          Useful snippets that I use a lot or found really helpful on Internet.
        </p>
        <p>
          So far, I have posted <strong>{snippets.length}</strong>{" "}
          {snippets.length === 1 ? "snippet" : "snippets"}.
        </p>
      </HeroSection>
      <PostSearchList
        posts={snippets}
        noun="snippet"
        renderPost={(snippet) => <SnippetCard snippet={snippet} />}
      />
    </>
  );
}
