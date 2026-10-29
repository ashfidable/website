import { createFileRoute } from "@tanstack/react-router";
import { TerminalHome } from "@/components/terminal/panels";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/config")({
  head: () =>
    seo({
      title: "Config",
      description: "Customize the theme, sound, shortcuts and reading preferences.",
      path: "/config",
    }),
  component: () => <TerminalHome tab="config" />,
});
