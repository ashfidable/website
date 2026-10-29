import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { Await, RouterProvider } from "@tanstack/react-router";
import { hydrateStart } from "@tanstack/react-start/client";
import { loadPost } from "$content/index";

const match = /^\/(blog|snippets)\/([^/]+)\/?$/.exec(window.location.pathname);
const article =
  match && (match[1] === "blog" || match[1] === "snippets")
    ? loadPost(match[1], decodeURIComponent(match[2]))
    : Promise.resolve();
// Start hydration normally so React can replay early interactions, but keep the
// server HTML until both the current route and article are ready to hydrate.
const ready = Promise.all([hydrateStart(), article]).then(([router]) => router);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <Await promise={ready} children={(router) => <RouterProvider router={router} />} />
    </StrictMode>,
  );
});
