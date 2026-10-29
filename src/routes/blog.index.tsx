import { createFileRoute } from "@tanstack/react-router";
import { TerminalHome } from "@/components/terminal/panels";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () =>
    seo({
      title: "Blog",
      description: "Thoughts, tutorials, game reviews and deep dives.",
      path: "/blog",
    }),
  component: () => <TerminalHome tab="blog" />,
});
