import { Link } from "@tanstack/react-router";
import {
  lazy,
  Suspense,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { categories, tools } from "$content/index";
import { themeNames, useSettings, type ThemeName } from "@/providers/settings-provider";
import { playAudio } from "@/utils/play-audio";
import { Icon } from "../icon";
import { themeLabels } from "@/providers/settings-provider";
import { Sprite } from "../site";
import { focusRing, latestPosts, latestSnippets, sortedSkills } from "./data";
import { type TabId } from "./layout";
import {
  CHAR_MS,
  MoreLink,
  PostRows,
  Prompt,
  Script,
  ToolRows,
  stackLabels,
  type Step,
} from "./ui";

function homeSteps(): Step[] {
  return [
    {
      command: "whoami",
      staggerRows: 2,
      content: (
        <div className="terminal-hero flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div data-reveal-row className="shrink-0 rounded bg-site-button p-1">
            <Sprite pixelScale={1.5} />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 data-reveal-row className="font-bold">
              <span className="text-site-heading">Ashfid</span>
              <span className="mt-1 block font-normal text-site-muted sm:mt-0 sm:inline">
                <span className="hidden sm:inline"> — </span>software engineer · game dev
              </span>
            </h1>
            <p
              data-reveal-row
              style={{ "--row": "1" } as CSSProperties}
              className="max-w-[68ch] leading-relaxed"
            >
              Welcome to my digital garden 🌱 I write tutorials, game reviews, and break down how
              game mechanics work.
              <span className="hidden sm:inline"> No over-engineering, just fun.</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      command: "ls -lt ~/blog | head -3",
      label: "Latest posts",
      staggerRows: Math.min(latestPosts.length, 3) + Number(latestPosts.length > 3),
      content: (
        <>
          <PostRows items={latestPosts.slice(0, 3)} />
          {latestPosts.length > 3 && (
            <MoreLink row={3} to="/blog">
              → all {latestPosts.length} posts
            </MoreLink>
          )}
        </>
      ),
    },
    {
      command: "ls -lt ~/snippets | head -3",
      label: "Latest snippets",
      staggerRows: Math.min(latestSnippets.length, 3) + Number(latestSnippets.length > 3),
      content: (
        <>
          <PostRows items={latestSnippets.slice(0, 3)} />
          {latestSnippets.length > 3 && (
            <MoreLink row={3} to="/snippets">
              → all {latestSnippets.length} snippets
            </MoreLink>
          )}
        </>
      ),
    },
    {
      command: "cat stack.txt",
      label: "Stack",
      staggerRows: sortedSkills.length,
      content: (
        <dl className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {sortedSkills.map((skill, index) => (
            <div key={skill.id} data-reveal-row style={{ "--row": String(index) } as CSSProperties}>
              <dt className="mb-2 text-site-heading">
                <span aria-hidden="true">{stackLabels[skill.id] ?? skill.id}</span>
                <span className="sr-only">{skill.title}</span>
              </dt>
              <dd className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-1">
                {skill.entries.map((entry) => (
                  <span key={entry.name} className="inline-flex items-center gap-2">
                    <Icon name={entry.icon} className="shrink-0" />
                    {entry.name}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      ),
    },
  ];
}

export function ToolsPanel({ category }: { category?: string }) {
  const [entering, setEntering] = useState(true);
  const previousCategory = useRef(category);
  // The tools layout stays mounted across filters, including browser Back/Forward.
  useLayoutEffect(() => {
    if (previousCategory.current !== category) setEntering(false);
    previousCategory.current = category;
  }, [category]);
  const selected = category ?? "all";
  const used = categories.filter((item) => tools.some((tool) => tool.categories.includes(item.id)));
  const shown = category ? tools.filter((tool) => tool.categories.includes(category)) : tools;
  const command = category ? `ls ${category}/` : "ls";
  return (
    <section data-tools-panel>
      <h1 className="break-words font-normal">
        <span className="font-semibold text-site-heading sm:sr-only">Tools I use</span>
        <span aria-hidden="true" className="hidden sm:inline">
          <Prompt path="~/tools" />
          <span
            className="type-in"
            style={
              {
                "--chars": String(command.length),
                "--char-ms": `${CHAR_MS}ms`,
                "--delay": "60ms",
              } as CSSProperties
            }
          >
            {command}
          </span>
        </span>
      </h1>
      <div className="mt-2">
        <p className="text-site-muted"># apps and services I use, or have used, every day</p>
        <div role="group" aria-label="Filter tools" className="my-3 flex flex-wrap gap-1.5">
          {["all", ...used.map((category) => category.id)].map((id) => (
            <Link
              key={id}
              to={id === "all" ? "/tools" : "/tools/$category"}
              params={{ category: id }}
              viewTransition
              onClick={() => flushSync(() => setEntering(false))}
              resetScroll={false}
              aria-current={selected === id ? "page" : undefined}
              className={`min-h-9 rounded border px-2 py-1 transition-colors sm:min-h-0 sm:py-0.5 duration-200 ${focusRing} ${
                selected === id
                  ? "border-site-heading bg-site-button text-site-heading"
                  : "border-site-border text-site-muted hover:border-site-border-hover hover:text-site-foreground"
              }`}
            >
              {id}
            </Link>
          ))}
        </div>
        <div
          className={entering ? "stagger-output" : undefined}
          style={{ "--delay": "60ms" } as CSSProperties}
        >
          <ToolRows items={shown} />
        </div>
        <p aria-live="polite" className="sr-only">
          {shown.length} tools
        </p>
      </div>
    </section>
  );
}

function Choice<T extends string>({
  name,
  row,
  value,
  options,
  onChange,
  render = (option) => option,
  children,
}: {
  name: string;
  row: number;
  value: T | undefined;
  options: readonly T[];
  onChange: (value: T) => void;
  render?: (option: T) => ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      role="radiogroup"
      data-reveal-row
      style={{ "--row": String(row) } as CSSProperties}
      aria-labelledby={`garden-${name}-label`}
      className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:gap-4"
    >
      <span id={`garden-${name}-label`} className="shrink-0 text-site-heading md:w-24">
        {name} =
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name={`garden-${name}`}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded border border-site-border px-2 py-1 text-site-muted sm:min-h-0 sm:py-0.5 transition-colors hover:border-site-border-hover hover:text-site-foreground peer-checked:border-site-heading peer-checked:text-site-heading peer-focus-visible:ring-2 peer-focus-visible:ring-site-ring">
              {render(option)}
            </span>
          </label>
        ))}
        {children}
      </div>
    </div>
  );
}

const ThemeBrowser = lazy(() => import("./theme-browser"));

function ConfigPanel() {
  const [browsing, setBrowsing] = useState(false);
  const [browserOpened, setBrowserOpened] = useState(false);
  const settings = useSettings();
  const click = (enabled = settings.sound) => playAudio("/audio/sound_toggle_on.mp3", enabled);

  return (
    <Script
      headingLevel={1}
      path="~/config"
      steps={[
        {
          command: "nano config.toml",
          label: "Config",
          staggerRows: 5,
          content: (
            <div className="space-y-3">
              <noscript>
                <p>
                  Enable JavaScript to change preferences. All pages are still available to read.
                </p>
              </noscript>
              <div data-js-only className="space-y-3">
                <p className="text-site-muted"># pick an option — changes save automatically</p>
                <Choice<ThemeName>
                  name="theme"
                  row={0}
                  value={settings.communityTheme ? undefined : settings.theme}
                  options={themeNames}
                  onChange={(theme) => {
                    settings.changeTheme(theme);
                    click();
                  }}
                  render={(theme) => (
                    <>
                      <span
                        data-theme={theme}
                        aria-hidden="true"
                        className="h-3 w-3 rounded-full border border-site-border bg-gradient-to-br from-[var(--color-theme-primary)] from-50% to-[var(--color-theme-secondary)] to-50%"
                      />
                      <span className="sr-only">{themeLabels[theme]}</span>
                      <span aria-hidden="true">{theme}</span>
                    </>
                  )}
                >
                  <button
                    type="button"
                    aria-label="Browse themes"
                    aria-expanded={browsing}
                    aria-controls="community-themes"
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded border px-2 py-1 transition-colors hover:border-site-border-hover hover:text-site-foreground focus-visible:ring-2 focus-visible:ring-site-ring sm:min-h-0 sm:py-0.5 ${
                      settings.communityTheme
                        ? "border-site-heading text-site-heading"
                        : "border-site-border text-site-muted"
                    }`}
                    onPointerEnter={() => void import("./theme-browser")}
                    onClick={() => {
                      setBrowsing(!browsing);
                      setBrowserOpened(true);
                    }}
                  >
                    {settings.communityTheme?.name ?? "browse"}
                    <span
                      aria-hidden="true"
                      className={`text-xs transition-transform motion-reduce:transition-none ${browsing ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                </Choice>
                <div
                  id="community-themes"
                  inert={!browsing}
                  className={`-mt-3 grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none md:ml-28 ${
                    browsing ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    {browserOpened && (
                      <Suspense fallback={null}>
                        <ThemeBrowser />
                      </Suspense>
                    )}
                  </div>
                </div>
                <Choice
                  name="shortcuts"
                  row={1}
                  value={settings.shortcuts ? "on" : "off"}
                  options={["on", "off"] as const}
                  onChange={(value) => {
                    if ((value === "on") !== settings.shortcuts) settings.toggleShortcuts();
                  }}
                />
                <Choice
                  name="sound"
                  row={2}
                  value={settings.sound ? "on" : "off"}
                  options={["on", "off"] as const}
                  onChange={(value) => {
                    if ((value === "on") !== settings.sound) settings.toggleSound();
                    click(value === "on");
                  }}
                />
                <Choice
                  name="corners"
                  row={3}
                  value={settings.rounded ? "rounded" : "square"}
                  options={["rounded", "square"] as const}
                  onChange={(value) => {
                    if ((value === "rounded") !== settings.rounded) settings.toggleRounded();
                    click();
                  }}
                />
                <Choice
                  name="spoilers"
                  row={4}
                  value={settings.hideSpoilers ? "hide" : "show"}
                  options={["hide", "show"] as const}
                  onChange={(value) => {
                    if ((value === "hide") !== settings.hideSpoilers) settings.toggleSpoilers();
                    click();
                  }}
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}

/** Shared terminal panels, each mounted at its own route. */
export function TerminalHome({ tab }: { tab: TabId }) {
  if (tab === "blog")
    return (
      <Script
        headingLevel={1}
        path="~/blog"
        steps={[
          {
            command: "ls -lt",
            label: "Blog posts",
            staggerRows: latestPosts.length,
            content: (
              <>
                <p className="mb-2 text-site-muted"># thoughts, reviews and deep dives</p>
                <PostRows items={latestPosts} detailed />
              </>
            ),
          },
        ]}
      />
    );
  if (tab === "snippets")
    return (
      <Script
        headingLevel={1}
        path="~/snippets"
        steps={[
          {
            command: "ls -lt",
            label: "Snippets",
            staggerRows: latestSnippets.length,
            content: (
              <>
                <p className="mb-2 text-site-muted"># small, copy-paste-ready bits of code</p>
                <PostRows items={latestSnippets} detailed />
              </>
            ),
          },
        ]}
      />
    );
  if (tab === "tools") return <ToolsPanel />;
  if (tab === "config") return <ConfigPanel />;
  return <Script path="~" steps={homeSteps()} />;
}
