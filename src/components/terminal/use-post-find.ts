import { useEffect, useRef, useState, type RefObject } from "react";

/** Highlight DOM ranges without changing React's markdown or code-block markup. */
export function usePostFind(panel: RefObject<HTMLDivElement | null>, query: string, page: string) {
  const ranges = useRef<Range[]>([]);
  const current = useRef(0);
  const [result, setResult] = useState({ count: 0, index: 0, supported: true });

  const select = (index: number, scroll = true) => {
    const matches = ranges.current;
    if (!matches.length) return;
    current.current = (index + matches.length) % matches.length;
    const range = matches[current.current];
    const highlight = new Highlight(range);
    highlight.priority = 2;
    CSS.highlights.set("post-find-current", highlight);
    setResult({ count: matches.length, index: current.current, supported: true });
    const container = panel.current;
    if (container && scroll) {
      const rect = range.getBoundingClientRect();
      container.scrollTo({
        top:
          container.scrollTop +
          rect.top -
          container.getBoundingClientRect().top -
          container.clientHeight / 3,
        behavior: "instant",
      });
    }
  };

  useEffect(() => {
    const supported = typeof Highlight !== "undefined" && !!CSS.highlights;
    if (!supported) {
      setResult({ count: 0, index: 0, supported: false });
      return;
    }
    const clear = () => {
      CSS.highlights.delete("post-find");
      CSS.highlights.delete("post-find-current");
      ranges.current = [];
    };
    clear();
    current.current = 0;
    setResult({ count: 0, index: 0, supported: true });
    const article = panel.current?.querySelector("[data-terminal-post]");
    if (!query || !article) return clear;

    const update = (scroll = false) => {
      clear();
      // Keep inline emphasis/code searchable as part of a sentence, but separate blocks.
      const groups = new Map<Element, Text[]>();
      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (
          !parent ||
          parent.closest(
            'nav, dl, button, script, style, [hidden], [aria-hidden="true"], .sr-only',
          ) ||
          !parent.getClientRects().length
        )
          continue;
        const block =
          parent.closest("p, h1, h2, h3, h4, h5, h6, li, pre, td, th, figcaption") ?? article;
        const texts = groups.get(block) ?? [];
        texts.push(node as Text);
        groups.set(block, texts);
      }
      const expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      for (const texts of groups.values()) {
        const text = texts.map((node) => node.data).join("");
        for (const match of text.matchAll(expression)) {
          const start = match.index!;
          const end = start + match[0].length;
          const range = document.createRange();
          let offset = 0;
          for (const node of texts) {
            const next = offset + node.length;
            if (start >= offset && start < next) range.setStart(node, start - offset);
            if (end > offset && end <= next) {
              range.setEnd(node, end - offset);
              break;
            }
            offset = next;
          }
          ranges.current.push(range);
        }
      }
      CSS.highlights.set("post-find", new Highlight(...ranges.current));
      if (ranges.current.length)
        select(Math.min(current.current, ranges.current.length - 1), scroll);
      else setResult({ count: 0, index: 0, supported: true });
    };
    update(true);
    // Code tabs and expandable content can change which text is visible.
    const observer = new MutationObserver(() => update());
    observer.observe(article, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["hidden", "class", "style"],
    });
    return () => {
      observer.disconnect();
      clear();
    };
  }, [query, page]);

  return {
    ...result,
    next: () => select(current.current + 1),
    previous: () => select(current.current - 1),
  };
}
