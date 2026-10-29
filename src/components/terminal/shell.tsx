import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Component,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { TerminalStatusSlot } from "./status-slot";
import { usePostFind } from "./use-post-find";
import { useLanyard } from "use-lanyard";
import { site, socialLinks, tools } from "$content/index";
import { themeNames, useSettings } from "@/providers/settings-provider";
import { playAudio } from "@/utils/play-audio";
import { themeLabels } from "@/providers/settings-provider";
import { Sprite } from "../site";
import { focusRing, latestPosts, latestSnippets, shellUser } from "./data";
import { tabs, tabPath, type TabId } from "./layout";
import {
  Kbd,
  MoreLink,
  PostRows,
  Prompt,
  Script,
  ToolRows,
  calmTransition,
  filterEntries,
  type Step,
} from "./ui";

const primaryTabIds: readonly TabId[] = ["home", "blog", "snippets"];
const moreTabs = tabs.filter((tab) => !primaryTabIds.includes(tab.id));

const COMMANDS = [
  "help",
  "ls",
  "cd",
  "open",
  "theme",
  "sound",
  "clear",
  "whoami",
  "sudo",
  "exit",
  "print",
];

/* ---------------------------------------------------------------------------------------------- */
/* Search + help output */

function SearchResults({ query }: { query: string }) {
  const needle = query.toLowerCase();
  const posts = filterEntries(latestPosts, needle);
  const snippets = filterEntries(latestSnippets, needle);
  const toolMatches = tools.filter((tool) =>
    [tool.title, tool.description, ...tool.categories].join(" ").toLowerCase().includes(needle),
  );
  const total = posts.length + snippets.length + toolMatches.length;
  const group = (name: string, node: ReactNode) => (
    <section>
      <h2 className="text-site-heading">{name}/</h2>
      <div className="mt-1">{node}</div>
    </section>
  );

  return (
    <div className="space-y-5">
      <h1 className="font-normal">
        <span className="sr-only">Search results</span>
        <span aria-hidden="true">
          <Prompt />
          grep -ri "{query}" .
        </span>
      </h1>
      {posts.length > 0 && group("blog", <PostRows items={posts} query={needle} />)}
      {snippets.length > 0 && group("snippets", <PostRows items={snippets} query={needle} />)}
      {toolMatches.length > 0 && group("tools", <ToolRows items={toolMatches} query={needle} />)}
      <p className="text-site-muted">
        {total
          ? `# ${total} match${total === 1 ? "" : "es"} — enter opens the first, esc clears`
          : "# no matches — try another word, or pick a tab above"}
      </p>
    </div>
  );
}

const helpRows = [
  ["1 – 5", "switch tabs; disable shortcuts in config"],
  ["/", "jump to the prompt"],
  ["any word", "search posts, snippets and tools"],
  ["cd <tab>", "home, blog, snippets, tools, config"],
  ["theme <name>", themeNames.join(", ")],
  ["sound on|off", "toggle sound effects"],
  ["clear", "back to where you were"],
];

/* ---------------------------------------------------------------------------------------------- */
/* Window controls: close is decoration, minimize docks the window, maximize fills the screen. */

type WindowMode = "normal" | "max" | "min";

function WindowControls({
  mode,
  onMinimize,
  onToggleMaximize,
}: {
  mode: WindowMode;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}) {
  const dot =
    "relative grid size-6 place-items-center rounded-full text-black/60 before:absolute before:size-3 before:rounded-full";
  const button = `${dot} !bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-1 focus-visible:ring-offset-site-button`;
  const glyph =
    "relative h-2 w-2 opacity-0 transition-opacity group-hover/controls:opacity-100 group-focus-within/controls:opacity-100";
  return (
    <div className="group/controls mb-1.5 hidden shrink-0 items-center gap-0 pl-1 sm:flex">
      <span aria-hidden="true" title="Close" className={`${dot} before:bg-red-400`}>
        <svg viewBox="0 0 8 8" className={glyph}>
          <path
            d="M2 2l4 4m0-4L2 6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <button
        type="button"
        onClick={onMinimize}
        aria-label="Minimize window"
        title="Minimize"
        className={`${button} before:bg-yellow-400`}
      >
        <svg viewBox="0 0 8 8" className={glyph} aria-hidden="true">
          <path d="M1.75 4h4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onToggleMaximize}
        aria-label={mode === "max" ? "Restore window size" : "Maximize window"}
        aria-pressed={mode === "max"}
        title={mode === "max" ? "Restore (Esc)" : "Maximize"}
        className={`${button} before:bg-green-400`}
      >
        <svg viewBox="0 0 8 8" className={glyph} aria-hidden="true">
          <path
            fill="currentColor"
            d={
              mode === "max"
                ? "M3.6 3.6H1.4l2.2-2.2zM4.4 4.4h2.2L4.4 6.6z"
                : "M1.6 1.6h2.6L1.6 4.2zM6.4 6.4H3.8l2.6-2.6z"
            }
          />
        </svg>
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Status bar: live Discord/Spotify presence, reading progress, links, key hints. */

/** use-lanyard can throw while its socket is still connecting — never let that take the page down. */
class PresenceBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <span className="truncate">tending the garden 🌱</span>
    ) : (
      this.props.children
    );
  }
}

const statusStyles: Record<string, { label: string; dot: string }> = {
  online: { label: "Online", dot: "bg-green-500" },
  idle: { label: "Idle", dot: "bg-yellow-500" },
  dnd: { label: "Do not disturb", dot: "bg-red-500" },
  offline: { label: "Offline", dot: "bg-site-muted" },
};

const activityVerbs: Record<number, string> = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  5: "Competing in",
};

function Presence() {
  const data = useLanyard(site.discordId as `${bigint}`);
  const spotify = data?.spotify;
  const activity = data?.activities?.find((item) => item.type !== 4) ?? data?.activities?.[0];
  const status = statusStyles[data?.discord_status ?? "offline"] ?? statusStyles.offline;

  let doing = "";
  if (spotify) doing = `Listening to ${spotify.song} — ${spotify.artist}`;
  else if (activity?.type === 4)
    doing = [activity.emoji?.name, activity.state].filter(Boolean).join(" ");
  else if (activity)
    doing = [`${activityVerbs[activity.type] ?? "Playing"} ${activity.name}`, activity.details]
      .filter(Boolean)
      .join(" — ");

  return (
    <>
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${data ? status.dot : "bg-site-muted"}`}
      />
      <span className="truncate">
        <span className="sr-only">Ashfid is </span>
        {data ? (
          <>
            <span className="text-site-foreground">{status.label}</span>
            {doing && ` · ${doing}`}
          </>
        ) : (
          "Connecting…"
        )}
      </span>
    </>
  );
}

function StatusBar({
  progress,
  onTop,
  likeSlot,
}: {
  progress: number | null;
  onTop: () => void;
  likeSlot: (element: HTMLSpanElement | null) => void;
}) {
  return (
    <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-site-border bg-site-button px-4 py-1.5 text-xs text-site-muted md:px-6">
      <p className="flex min-w-0 items-center gap-2">
        <PresenceBoundary>
          <Presence />
        </PresenceBoundary>
      </p>
      <nav aria-label="Links" className="flex min-h-7 shrink-0 items-center gap-3">
        <span ref={likeSlot} data-status-like className="empty:hidden inline-flex" />
        {progress !== null && (
          <button
            type="button"
            onClick={onTop}
            title="Back to top"
            aria-label={`${progress}% read — back to top`}
            className={`rounded tabular-nums text-site-foreground hover:text-site-heading ${focusRing}`}
          >
            ↑ {progress}%
          </button>
        )}
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            className={`hidden rounded hover:text-site-heading sm:inline ${focusRing}`}
          >
            {social.name.toLowerCase()}
          </a>
        ))}
        <a
          href={site.supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded hover:text-site-heading ${focusRing}`}
        >
          ☕ coffee
        </a>
        <span aria-hidden="true" className="hidden items-center gap-1 md:flex">
          <Kbd>?</Kbd> help
        </span>
      </nav>
    </footer>
  );
}

/* ---------------------------------------------------------------------------------------------- */

/**
 * The terminal window. Lives in the root layout and stays mounted across navigation, so tabs,
 * the prompt, and the window state carry over between the home page and posts.
 */
export function TerminalShell({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const baseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLButtonElement>(null);
  const previousMode = useRef<WindowMode>("normal");
  const [windowMode, setWindowMode] = useState<WindowMode>("normal");
  const [indicator, setIndicator] = useState<{ left: number; width: number }>();
  const [value, setValue] = useState("");
  const [output, setOutput] = useState<{ id: number; step: Step } | null>(null);
  const [likeSlot, setLikeSlot] = useState<HTMLSpanElement | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const { pathname } = location;
  const isPost = /^\/(blog|snippets)\/[^/]+\/?$/.test(pathname);
  const active: TabId =
    tabs.find(
      (item) =>
        item.href !== "/" && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    )?.id ?? "home";
  const tab = tabs.find((item) => item.id === active)!;
  const tabId = (id: TabId) => `${baseId}-tab-${id}`;
  const moreId = `${baseId}-more`;
  const moreActive = !primaryTabIds.includes(active);

  const words = value.trim().split(/\s+/);
  const first = words[0]?.toLowerCase() ?? "";
  const isCommand = COMMANDS.includes(first);
  const query = first === "grep" ? words.slice(1).join(" ") : isCommand ? "" : value.trim();

  const find = usePostFind(
    panelRef,
    isPost && !output && windowMode !== "min" ? query : "",
    pathname,
  );

  const changeMode = (next: WindowMode) => calmTransition("window", () => setWindowMode(next));
  const openTab = (id: TabId) => {
    navigate({ to: tabPath(id) });
  };

  // Clear transient output on navigation. The router resets the panel after rendering.
  useEffect(() => {
    setOutput(null);
    setValue("");
  }, [location.href]);

  // Sliding accent bar under the active tab.
  useLayoutEffect(() => {
    const list = tablistRef.current;
    if (!list) return;
    const measure = () => {
      const tabEl = document.getElementById(tabId(active));
      if (tabEl) setIndicator({ left: tabEl.offsetLeft + 10, width: tabEl.offsetWidth - 20 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active, windowMode]);

  // Maximized: lock page scroll. Minimized: focus the dock; restored from dock: focus the tab.
  useEffect(() => {
    const was = previousMode.current;
    previousMode.current = windowMode;
    if (windowMode === "min") dockRef.current?.focus();
    if (was === "min" && windowMode !== "min") document.getElementById(tabId(active))?.focus();
    if (windowMode !== "max") return;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = overflow;
    };
  }, [windowMode]);

  // Reading progress follows the terminal panel at every screen size.
  useEffect(() => {
    if (!isPost || windowMode === "min") return setProgress(null);
    const panel = panelRef.current;
    const update = () => {
      const element = panel;
      if (!element) return;
      const max = element.scrollHeight - element.clientHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((element.scrollTop / max) * 100)) : 100);
    };
    update();
    const observer = new ResizeObserver(update);
    if (panel) observer.observe(panel);
    const content = panel?.querySelector("[data-terminal-route]");
    if (content) observer.observe(content);
    panel?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      panel?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isPost, pathname, windowMode]);

  const say = (command: string, content: ReactNode) =>
    setOutput({ id: Date.now(), step: { command, label: command, content } });

  const showHelp = () =>
    say(
      "help",
      <dl className="grid gap-x-6 gap-y-1 md:grid-cols-[8rem_1fr]">
        {[
          ...helpRows.map(([key, about]) => [
            key,
            isPost && key === "any word" ? "find and highlight text in this post" : about,
          ]),
          [
            "grep <text>",
            isPost
              ? "find text in this post, including command words"
              : "search posts, snippets and tools",
          ],
          ...(isPost
            ? [
                ["enter / shift+enter", "next / previous match"],
                ["esc", "clear find or close help"],
                ["print", "open the browser print dialog"],
              ]
            : []),
        ].map(([key, about]) => (
          <div key={key} className="contents">
            <dt className="text-site-heading">{key}</dt>
            <dd className="text-site-muted">{about}</dd>
          </div>
        ))}
      </dl>,
    );

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const moreMenu = document.getElementById(moreId);
      if (moreMenu?.matches(":popover-open") && moreMenu.getClientRects().length) return;
      if (event.key === "Escape" && (output || value)) {
        event.preventDefault();
        setValue("");
        setOutput(null);
        inputRef.current?.focus();
        return;
      }
      if (event.key === "Escape" && windowMode === "max" && !value) return changeMode("normal");
      if (windowMode === "min") return;
      if (event.metaKey || event.ctrlKey || event.altKey || !settings.shortcuts) return;
      if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable]"))
        return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < tabs.length) openTab(tabs[index].id);
      if (event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "?") showHelp();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onTabKeyDown = (event: KeyboardEvent) => {
    const visibleTabs = tabs.filter(
      (item) => document.getElementById(tabId(item.id))?.getClientRects().length,
    );
    const index = visibleTabs.findIndex((item) => item.id === active);
    const next = {
      ArrowRight: (index + 1) % visibleTabs.length,
      ArrowLeft: (index - 1 + visibleTabs.length) % visibleTabs.length,
      Home: 0,
      End: visibleTabs.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    openTab(visibleTabs[next].id);
    requestAnimationFrame(() => document.getElementById(tabId(visibleTabs[next].id))?.focus());
  };

  const run = (event: FormEvent) => {
    event.preventDefault();
    if (!isCommand) {
      if (isPost) return find.next();
      const needle = query.toLowerCase();
      const hit = [
        ...filterEntries(latestPosts, needle),
        ...filterEntries(latestSnippets, needle),
      ][0];
      if (needle && hit) navigate({ to: `/${hit.kind}/${hit.slug}` as any });
      return;
    }
    const command = value.trim();
    const arg = words
      .slice(1)
      .join(" ")
      .toLowerCase()
      .replace(/^~\/?|\/$/g, "");
    const target = tabs.find(
      (item) =>
        item.id === arg ||
        ([".config", "settings"].includes(arg) && item.id === "config") ||
        (arg === "~" && item.id === "home"),
    );
    setValue("");
    switch (first) {
      case "print":
        if (!isPost) return say(command, "Open a blog post or snippet, then type print.");
        // Reveal the article before the browser takes its print snapshot.
        flushSync(() => {
          setOutput(null);
          setValue("");
        });
        return window.print();
      case "help":
        return showHelp();
      case "ls":
      case "cd":
      case "open":
        if (target) return openTab(target.id);
        if (first === "cd" && (!arg || arg === "..")) return openTab("home");
        return say(
          command,
          arg ? `${first}: no such directory: ${arg}` : "blog/  snippets/  tools/  config/",
        );
      case "whoami":
        return openTab("home");
      case "theme": {
        const theme = themeNames.find((name) => name === arg);
        if (!theme) return say(command, `themes: ${themeNames.join("  ")}`);
        settings.changeTheme(theme);
        playAudio("/audio/sound_toggle_on.mp3", settings.sound);
        return say(command, `✓ theme set to ${themeLabels[theme]}`);
      }
      case "sound":
        if (arg !== "on" && arg !== "off")
          return say(command, `sound is ${settings.sound ? "on" : "off"} — try “sound off”`);
        if ((arg === "on") !== settings.sound) settings.toggleSound();
        if (arg === "on") playAudio("/audio/sound_toggle_on.mp3");
        return say(command, `✓ sound ${arg}`);
      case "clear":
        return setOutput(null);
      case "sudo":
        return say(command, "nice try 🙂");
      case "exit":
        return say(command, "there’s no escape from the garden 🌱");
    }
  };

  const overlay =
    query && !isPost ? (
      <SearchResults query={query} />
    ) : output ? (
      <div className="space-y-3">
        <Script headingLevel={1} key={output.id} path={tab.path} steps={[output.step]} />
        <MoreLink onClick={() => setOutput(null)}>← back</MoreLink>
      </div>
    ) : null;

  if (windowMode === "min")
    return (
      <>
        <h1 className="sr-only">Ashfid’s digital garden</h1>
        <button
          ref={dockRef}
          type="button"
          data-terminal-window
          onClick={() => changeMode("normal")}
          aria-label="Open the terminal window"
          className={`group fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-site-border bg-site-card py-2 pl-2 pr-4 font-mono text-sm shadow-2xl transition-transform duration-200 hover:-translate-y-1 ${focusRing}`}
        >
          <span className="rounded-lg bg-site-button p-1">
            <Sprite pixelScale={0.75} />
          </span>
          <span className="text-left">
            <span className="block font-bold">{shellUser}</span>
            <span className="block text-xs text-site-muted">minimized · click to open</span>
          </span>
          <span
            aria-hidden="true"
            className="absolute -bottom-2.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-site-heading"
          />
        </button>
      </>
    );

  return (
    <section
      aria-label="Ashfid’s digital garden"
      data-terminal-window
      className={`flex min-h-0 flex-col overflow-hidden bg-site-card font-mono text-sm ${
        windowMode === "max"
          ? "fixed inset-0 z-[80]"
          : "flex-1 rounded-md border border-b-4 border-site-border shadow-lg"
      }`}
    >
      {/* Title bar = tabs */}
      <div className="flex shrink-0 items-end gap-3 border-b border-site-border bg-site-button px-1 pt-1.5 gap-x-0 sm:gap-x-3 sm:px-2 md:px-3">
        <WindowControls
          mode={windowMode}
          onMinimize={() => changeMode("min")}
          onToggleMaximize={() => changeMode(windowMode === "max" ? "normal" : "max")}
        />
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Sections"
          onKeyDown={onTabKeyDown}
          className="relative -mb-px flex min-w-0 flex-1 pb-px sm:overflow-x-auto"
        >
          {/* Accent bar that slides between tabs. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-0 z-10 hidden sm:block h-0.5 rounded-b bg-site-heading transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${indicator ? "opacity-100" : "opacity-0"}`}
            style={{ width: indicator?.width, transform: `translateX(${indicator?.left ?? 0}px)` }}
          />
          {tabs.map((item, index) => {
            const selected = item.id === active;
            const nextSelected = tabs[index + 1]?.id === active;
            return (
              <Link
                key={item.id}
                id={tabId(item.id)}
                to={item.href}
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={`group relative -mb-px min-h-11 min-w-0 flex-1 ${primaryTabIds.includes(item.id) ? "flex" : "hidden sm:flex"} items-center justify-center gap-1 rounded-t-md border border-b-0 px-0.5 py-2 text-xs sm:min-h-0 sm:flex-none sm:shrink-0 sm:gap-1.5 sm:px-3.5 sm:text-sm outline-none transition-colors duration-200 aria-selected:focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-site-ring md:px-4 ${
                  selected
                    ? "border-site-border bg-site-card text-site-foreground"
                    : "border-transparent text-site-muted hover:bg-site-card/50 hover:text-site-foreground"
                }`}
              >
                <span
                  className={`hidden transition-colors sm:inline ${selected ? "text-site-heading" : "text-site-muted group-hover:text-site-foreground"}`}
                >
                  {index + 1}.
                </span>
                <span
                  className={`min-w-0 [overflow-wrap:anywhere] ${selected ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
                {!selected && !nextSelected && index < tabs.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 top-1/2 hidden h-4 w-px -translate-y-1/2 bg-site-border sm:block"
                  />
                )}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          popoverTarget={moreId}
          aria-label={moreActive ? `More sections, ${tab.label} selected` : "More sections"}
          className={`terminal-more-trigger -mb-px flex min-h-11 w-1/4 shrink-0 items-center justify-center gap-1 rounded-t-md border border-b-0 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-site-ring sm:hidden ${moreActive ? "border-site-border bg-site-card font-semibold text-site-heading" : "border-transparent text-site-muted hover:text-site-heading"}`}
        >
          <span className="min-w-0 [overflow-wrap:anywhere]">More</span>{" "}
          <span aria-hidden="true">⌄</span>
        </button>
      </div>
      <nav
        id={moreId}
        popover="auto"
        aria-label="More sections"
        className="terminal-more-menu rounded-md border border-site-border bg-site-card p-2 font-mono text-sm text-site-foreground shadow-xl"
      >
        {moreTabs.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            onClick={() => document.getElementById(moreId)?.hidePopover()}
            aria-current={item.id === active ? "page" : undefined}
            className={`flex min-h-11 w-full items-center justify-between gap-4 rounded px-3 text-left hover:bg-site-card-hover ${focusRing} ${item.id === active ? "bg-site-button font-semibold text-site-heading" : ""}`}
          >
            {item.label}
            {item.id === active && <span aria-hidden="true">✓</span>}
          </Link>
        ))}
      </nav>

      {/* Panel — route content stays mounted (hidden) while search/command output shows. */}
      <div
        ref={panelRef}
        data-terminal-scroll
        tabIndex={0}
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 leading-relaxed sm:py-5 md:px-6"
      >
        {overlay && <div data-terminal-output>{overlay}</div>}
        <div data-terminal-route hidden={overlay !== null}>
          <TerminalStatusSlot.Provider value={likeSlot}>{children}</TerminalStatusSlot.Provider>
        </div>
      </div>

      {isPost && query && (
        <div
          className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-site-border bg-site-button px-4 py-1 text-xs md:px-6"
          data-post-find-controls
        >
          <span role="status" aria-live="polite">
            {!find.supported
              ? "Use your browser’s Find command"
              : find.count
                ? `${find.index + 1} / ${find.count} matches`
                : "No matches"}
          </span>
          <div className="flex w-full items-center gap-1 sm:w-auto">
            <button
              type="button"
              onClick={find.previous}
              disabled={!find.count}
              title="Previous match (Shift+Enter)"
              className={`flex min-h-7 flex-1 items-center justify-center gap-1 rounded border border-site-border bg-site-card px-1 py-0.5 text-site-foreground [&_kbd]:px-1 [&_kbd]:text-[10px] [&_kbd]:whitespace-nowrap sm:flex-none sm:px-2 hover:bg-site-card-hover disabled:cursor-default disabled:opacity-50 ${focusRing}`}
            >
              <span className="whitespace-nowrap text-xs">
                ↑<span className="hidden sm:inline"> Prev</span>
              </span>
              <Kbd>⇧ Enter</Kbd>
            </button>
            <button
              type="button"
              onClick={find.next}
              disabled={!find.count}
              title="Next match (Enter)"
              className={`flex min-h-7 flex-1 items-center justify-center gap-1 rounded border border-site-border bg-site-card px-1 py-0.5 text-site-foreground [&_kbd]:px-1 [&_kbd]:text-[10px] [&_kbd]:whitespace-nowrap sm:flex-none sm:px-2 hover:bg-site-card-hover disabled:cursor-default disabled:opacity-50 ${focusRing}`}
            >
              <span className="whitespace-nowrap text-xs">
                ↓<span className="hidden sm:inline"> Next</span>
              </span>
              <Kbd>Enter</Kbd>
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              title="Close search (Escape)"
              className={`flex min-h-7 flex-1 items-center justify-center gap-1 rounded border border-site-border bg-site-card px-1 py-0.5 text-site-foreground [&_kbd]:px-1 [&_kbd]:text-[10px] [&_kbd]:whitespace-nowrap sm:flex-none sm:px-2 hover:bg-site-card-hover disabled:cursor-default disabled:opacity-50 ${focusRing}`}
            >
              <span className="whitespace-nowrap text-xs">
                ×<span className="hidden sm:inline"> Close</span>
              </span>
              <Kbd>Esc</Kbd>
            </button>
          </div>
        </div>
      )}

      {/* Prompt */}
      <form
        onSubmit={run}
        role="search"
        className="flex shrink-0 flex-wrap items-center gap-1 border-t border-site-border px-4 py-2.5 md:px-6"
      >
        <label htmlFor={`${baseId}-prompt`} className="sr-only">
          {isPost
            ? "Type a word or phrase to search this post, or type a command like print or help"
            : "Search posts, snippets and tools, or type a command like help"}
        </label>
        <span aria-hidden="true" className="hidden shrink-0 whitespace-nowrap sm:inline">
          <Prompt path={query && !isPost ? "~" : tab.path} />
        </span>
        <input
          id={`${baseId}-prompt`}
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setOutput(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setValue("");
              setOutput(null);
            }
            if (event.key === "Enter" && event.shiftKey && isPost && query) {
              event.preventDefault();
              find.previous();
            }
          }}
          placeholder={isPost ? "Type a word to search this post" : "type to search, or help"}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-base caret-site-heading outline-none placeholder:text-site-muted md:text-sm [&::-webkit-search-cancel-button]:hidden"
        />
        <span aria-hidden="true" className="hidden shrink-0 text-xs text-site-muted md:inline">
          {isCommand && value.trim() ? "↵ run" : <Kbd>/</Kbd>}
        </span>
      </form>

      <StatusBar
        progress={progress}
        likeSlot={setLikeSlot}
        onTop={() => panelRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </section>
  );
}
