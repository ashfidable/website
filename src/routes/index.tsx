import { createFileRoute } from "@tanstack/react-router";
import { TerminalHome } from "@/components/terminal/panels";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Home",
      description: "Software engineering, game development, tutorials and reviews.",
      path: "/",
    }),
  component: () => <TerminalHome tab="home" />,
});
