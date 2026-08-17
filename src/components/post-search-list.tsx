import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { Post } from "$content/index";

type PostSearchListProps = {
  posts: Post[];
  noun: string;
  renderPost: (post: Post) => ReactNode;
};

export function PostSearchList({ posts, noun, renderPost }: PostSearchListProps) {
  const [query, setQuery] = useState("");
  const transitionId = useRef(0);
  const searchQuery = query.trim();
  const plural = `${noun}s`;
  const label = `Search ${plural}…`;
  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: "title", weight: 0.45 },
          { name: "description", weight: 0.25 },
          { name: "tags", weight: 0.15 },
          { name: "category", weight: 0.1 },
          { name: "body", weight: 0.05 },
        ],
        threshold: 0.45,
        ignoreLocation: true,
      }),
    [posts],
  );
  const results = useMemo(
    () => (searchQuery ? fuse.search(searchQuery).map(({ item }) => item) : posts),
    [fuse, posts, searchQuery],
  );
  const groups = useMemo(
    () =>
      [...posts]
        .sort((a, b) => a.published_time.getTime() - b.published_time.getTime())
        .reduce<Record<string, Post[]>>((result, post) => {
          const year = String(post.published_time.getFullYear());
          (result[year] ??= []).push(post);
          return result;
        }, {}),
    [posts],
  );
  const hasQuery = searchQuery.length > 0;
  const resultNoun = results.length === 1 ? noun : plural;

  function updateQuery(nextQuery: string) {
    if (!document.startViewTransition) {
      setQuery(nextQuery);
      return;
    }

    const id = ++transitionId.current;
    document.documentElement.dataset.searchTransition = "";
    try {
      const transition = document.startViewTransition(() => {
        flushSync(() => setQuery(nextQuery));
      });
      const clearTransition = () => {
        if (id === transitionId.current) {
          delete document.documentElement.dataset.searchTransition;
        }
      };
      void transition.finished.then(clearTransition, clearTransition);
    } catch {
      delete document.documentElement.dataset.searchTransition;
      setQuery(nextQuery);
    }
  }

  return (
    <>
      <div className="space-y-2">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-site-muted"
          />
          <label htmlFor={`${noun}-search`} className="sr-only">
            {label}
          </label>
          <input
            id={`${noun}-search`}
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") updateQuery("");
            }}
            placeholder={label}
            autoComplete="off"
            className="h-11 w-full rounded-md border border-site-border bg-site-card pl-10 pr-10 text-sm text-site-foreground outline-none transition-[border-color,box-shadow] placeholder:text-site-muted focus:border-site-border-hover focus:ring-2 focus:ring-site-ring [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => updateQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-site-muted outline-none transition-colors hover:bg-site-button-hover hover:text-site-foreground focus-visible:ring-2 focus-visible:ring-site-ring"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
        <p aria-live="polite" className="min-h-5 text-xs text-site-muted">
          {hasQuery
            ? `${results.length} ${resultNoun} found for “${searchQuery}”`
            : "Search by title, description, tag, category, or content."}
        </p>
      </div>

      {hasQuery ? (
        results.length > 0 ? (
          <section className="flex flex-col gap-4">
            <h2 className="font-site-heading text-xl font-bold">Search results</h2>
            <ul className="space-y-1">
              {results.map((post) => (
                <li key={post.id}>{renderPost(post)}</li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="rounded-md border border-dashed border-site-border bg-site-card p-6 text-center">
            <p className="font-site-heading font-semibold text-site-heading">No matches found</p>
            <p className="mt-1 text-sm text-site-muted">
              Try a shorter term or check the spelling.
            </p>
          </div>
        )
      ) : (
        Object.keys(groups)
          .reverse()
          .map((year) => (
            <section key={year} className="flex flex-col gap-4">
              <h2 className="font-site-heading text-xl font-bold">{year}</h2>
              <ul className="space-y-1">
                {groups[year]?.map((post) => (
                  <li key={post.id}>{renderPost(post)}</li>
                ))}
              </ul>
            </section>
          ))
      )}
    </>
  );
}
