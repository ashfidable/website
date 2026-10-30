import assert from "node:assert/strict";
import { test } from "node:test";
import { zipSync, strToU8 } from "fflate";
import { loadThemePack, mapColors } from "../src/lib/browse-themes.ts";
import { isCommunityTheme } from "../src/lib/community-theme.ts";

test("maps theme colors with safe light/dark fallbacks", () => {
  const colors = mapColors(
    {
      "editor.background": "#abc",
      "textLink.foreground": "url(https://example.com)",
      "panel.border": "#12345600",
    },
    "light",
  );
  assert.equal(colors.background, "#aabbcc");
  assert.equal(colors.accent, "#005fb8");
  assert.equal(colors.border, "#cccccc");
  assert.equal(mapColors({}, "dark").background, "#1e1e1e");
  const saved = { id: "test", name: "Test", source: "author/theme", mode: "light", colors };
  assert(isCommunityTheme(saved));
  assert(!isCommunityTheme({ ...saved, colors: { ...colors, accent: "red;display:none" } }));
  assert(!isCommunityTheme(null));
});

test("reads JSONC variants and inherited colors without executing extension code", async () => {
  const archive = zipSync(
    Object.fromEntries(
      Object.entries({
        "extension/package.json": JSON.stringify({
          contributes: {
            themes: [
              { label: "Night", path: "./themes/night.json", uiTheme: "vs-dark" },
              { label: "Day", path: "./themes/day.json", uiTheme: "vs" },
              { label: "Legacy", path: "./legacy.tmTheme" },
              { label: "Cycle", path: "./cycle.json" },
            ],
          },
        }),
        "extension/base.json":
          '{"colors":{"editor.foreground":"#abcdef","textLink.foreground":"#123456"}}',
        "extension/themes/night.json":
          '{ // comment\n "include":"../base.json", "colors":{"editor.background":"#102030",},}',
        "extension/themes/day.json": '{"colors":{"editor.background":"#ffffff"}}',
        "extension/cycle.json": '{"include":"cycle.json"}',
        "extension/extension.js": 'throw new Error("must never execute")',
      }).map(([path, content]) => [path, strToU8(content)]),
    ),
  );
  const original = globalThis.fetch;
  globalThis.fetch = async (url) =>
    String(url).endsWith(".vsix")
      ? new Response(archive)
      : Response.json({
          files: { download: "https://open-vsx.org/api/test/theme/file/theme.vsix" },
        });
  try {
    const themes = await loadThemePack(
      { namespace: "test", name: "theme", displayName: "Test" },
      new AbortController().signal,
    );
    assert.equal(themes.length, 2);
    assert.equal(themes[0].colors.foreground, "#abcdef");
    assert.equal(themes[0].colors.background, "#102030");
    assert.equal(themes[1].mode, "light");
    assert(themes.every(isCommunityTheme));
  } finally {
    globalThis.fetch = original;
  }
});
