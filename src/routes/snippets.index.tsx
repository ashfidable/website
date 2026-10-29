import { createFileRoute } from "@tanstack/react-router";
import { TerminalHome } from "@/components/terminal/panels";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/snippets/")({
  head: () =>
    seo({
      title: "Snippets",
      description: "Useful code snippets and development notes.",
      path: "/snippets",
    }),
  component: () => <TerminalHome tab="snippets" />,
});
