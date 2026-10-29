import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { ToolsPanel } from "@/components/terminal/panels";

export const Route = createFileRoute("/tools")({ component: ToolsLayout });

function ToolsLayout() {
  const { category } = useParams({ strict: false });
  return (
    <>
      <ToolsPanel category={category} />
      <Outlet />
    </>
  );
}
