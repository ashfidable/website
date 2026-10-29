import { createFileRoute } from "@tanstack/react-router";
import { TerminalHome } from "@/components/terminal/panels";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/tools/")({
  head: () => seo({ title: "Tools", description: "Explore the tools I use.", path: "/tools" }),
  component: () => <TerminalHome tab="tools" />,
});
