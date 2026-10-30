import { createRouter } from "@tanstack/react-router";
import { tabForPath } from "./components/terminal/layout";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    scrollToTopSelectors: ["[data-terminal-scroll]"],
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // Only a change of tab morphs; everything inside a tab updates in place.
    defaultViewTransition: {
      types: ({ fromLocation, toLocation }) =>
        fromLocation &&
        tabForPath(fromLocation.pathname) !== tabForPath(toLocation.pathname) &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
          ? ["terminal-tab"]
          : false,
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
