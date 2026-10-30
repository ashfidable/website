import { useEffect, useRef, useState } from "react";
import { featuredThemes, loadThemePack, searchThemes, type ThemePack } from "@/lib/browse-themes";
import type { CommunityTheme } from "@/lib/community-theme";
import { useSettings } from "@/providers/settings-provider";

const control =
  "rounded border border-site-border px-2 py-0.5 text-sm text-site-muted transition-colors hover:border-site-border-hover hover:text-site-foreground focus-visible:outline-2 focus-visible:outline-site-ring disabled:opacity-50";
const primary =
  "rounded border border-site-heading px-2 py-0.5 text-sm text-site-heading transition-colors hover:border-site-border-hover focus-visible:outline-2 focus-visible:outline-site-ring disabled:opacity-50";

function ThemePreview({ theme }: { theme: CommunityTheme }) {
  return (
    <div
      aria-label={`${theme.name} color preview`}
      className="space-y-1 rounded border p-2 font-mono text-sm"
      style={{
        background: theme.colors.background,
        color: theme.colors.foreground,
        borderColor: theme.colors.border,
        colorScheme: theme.mode,
      }}
    >
      <p style={{ color: theme.colors.accent }}>visitor@garden ~ % cat welcome.txt</p>
      <p>A little corner of the internet.</p>
      <p style={{ color: theme.colors.muted }}>Notes, projects, and things worth sharing.</p>
    </div>
  );
}

function ThemeRow({ pack }: { pack: ThemePack }) {
  const settings = useSettings();
  const [themes, setThemes] = useState<CommunityTheme[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [pending, setPending] = useState<"preview" | "apply" | null>(null);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  const source = `${pack.namespace}/${pack.name}`;
  const active = settings.communityTheme?.source === source ? settings.communityTheme : null;
  const selected =
    themes.find((theme) => theme.id === selectedId) ??
    themes.find((theme) => theme.id === active?.id) ??
    themes[0];
  const applied = !!active && (!selected || selected.id === active.id);

  async function load() {
    if (themes.length) return themes;
    const controller = new AbortController();
    request.current = controller;
    setError("");
    try {
      const loaded = await loadThemePack(pack, controller.signal);
      if (controller.signal.aborted) return [];
      setThemes(loaded);
      return loaded;
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "Could not load this theme. Try another theme.");
      return [];
    }
  }

  async function togglePreview() {
    if (previewing) return setPreviewing(false);
    setPending("preview");
    if ((await load()).length) setPreviewing(true);
    setPending(null);
  }

  async function apply() {
    setPending("apply");
    const loaded = await load();
    const theme = loaded.find((item) => item.id === selected?.id) ?? loaded[0];
    if (theme) settings.saveCommunityTheme(theme);
    setPending(null);
  }

  return (
    <li className="space-y-2 py-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="min-w-0 break-words text-site-foreground">
          {pack.displayName || pack.name}{" "}
          <span className="text-xs text-site-muted">by {pack.namespace}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={control}
            aria-expanded={previewing}
            disabled={!!pending}
            onClick={togglePreview}
          >
            {pending === "preview" ? "Loading…" : previewing ? "Hide preview" : "Preview"}
          </button>
          <button type="button" className={primary} disabled={!!pending || applied} onClick={apply}>
            {pending === "apply" ? "Applying…" : applied ? "Applied ✓" : "Apply"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm">
          {error}
        </p>
      )}
      {previewing && selected && (
        <div className="space-y-2">
          {themes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  aria-pressed={theme.id === selected.id}
                  className={`${control} ${theme.id === selected.id ? "border-site-heading" : ""}`}
                  onClick={() => setSelectedId(theme.id)}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          )}
          <ThemePreview theme={selected} />
          <a
            className="text-xs text-site-link underline"
            href={`https://open-vsx.org/extension/${selected.source.split("/").map(encodeURIComponent).join("/")}`}
            target="_blank"
            rel="noreferrer"
          >
            View theme & license ↗
          </a>
        </div>
      )}
    </li>
  );
}

export default function ThemeBrowser() {
  const [text, setText] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [packs, setPacks] = useState(featuredThemes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const query = text.trim();

  useEffect(() => {
    setError("");
    if (!query) {
      setPacks(featuredThemes);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      searchThemes(query, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) setPacks(result.extensions);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setPacks([]);
          setError("Could not search themes. Check your connection and try again.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, attempt]);

  return (
    <section aria-label="Browse community themes" className="space-y-1 p-0.5 pt-3">
      <div>
        <label className="sr-only" htmlFor="theme-search">
          Search themes
        </label>
        <input
          id="theme-search"
          type="search"
          maxLength={100}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search themes, e.g. Nord"
          className="w-full rounded border border-site-border bg-site-input px-2 py-1 text-sm text-site-foreground focus-visible:outline-2 focus-visible:outline-site-ring"
        />
      </div>
      <p role="status" className="text-sm text-site-muted empty:hidden">
        {loading
          ? "Searching…"
          : !error && !packs.length
            ? "No themes found. Try a different name."
            : ""}
      </p>
      {error && (
        <div role="alert" className="space-y-2">
          <p>{error}</p>
          <button
            type="button"
            className={control}
            onClick={() => setAttempt((current) => current + 1)}
          >
            Try again
          </button>
        </div>
      )}
      <ul className="divide-y divide-site-border" aria-busy={loading}>
        {packs.map((pack) => (
          <ThemeRow key={`${pack.namespace}/${pack.name}`} pack={pack} />
        ))}
      </ul>
      <p className="text-xs text-site-muted">
        Themes come from{" "}
        <a
          className="text-site-link underline"
          href="https://open-vsx.org"
          target="_blank"
          rel="noreferrer"
        >
          Open VSX
        </a>
        . Pick any built-in theme to switch back.
      </p>
    </section>
  );
}
