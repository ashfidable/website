export const tabs = [
  { id: "home", label: "home", path: "~", href: "/" },
  { id: "blog", label: "blog", path: "~/blog", href: "/blog" },
  { id: "snippets", label: "snippets", path: "~/snippets", href: "/snippets" },
  { id: "tools", label: "tools", path: "~/tools", href: "/tools" },
  { id: "config", label: "config", path: "~/config", href: "/config" },
] as const;
export type TabId = (typeof tabs)[number]["id"];
export type PanelTab = Exclude<TabId, "home">;

export function tabPath(id: TabId) {
  return tabs.find((tab) => tab.id === id)!.href;
}

export function tabForPath(pathname: string): TabId {
  return (
    tabs.find(
      (tab) => tab.href !== "/" && (pathname === tab.href || pathname.startsWith(`${tab.href}/`)),
    )?.id ?? "home"
  );
}
