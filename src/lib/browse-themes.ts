import { unzipSync, strFromU8 } from "fflate";
import { parse, type ParseError } from "jsonc-parser";

import type { CommunityTheme, Palette } from "./community-theme";
export type ThemePack = {
  namespace: string;
  name: string;
  displayName: string;
  description: string;
};
const registry = "https://open-vsx.org";
async function request(url: string, signal: AbortSignal) {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(20000)]),
  });
  if (!response.ok) throw new Error("Open VSX is unavailable. Please try again.");
  return response;
}
// The registry's Themes category also contains icon packs and language tools,
// so the starting list is a few known color-theme packs.
export const featuredThemes: ThemePack[] = [
  {
    namespace: "enkia",
    name: "tokyo-night",
    displayName: "Tokyo Night",
    description: "Cool blues and soft purple, in dark and light variants.",
  },
  {
    namespace: "dracula-theme",
    name: "theme-dracula",
    displayName: "Dracula",
    description: "A dark palette with purple, pink, and green accents.",
  },
  {
    namespace: "Catppuccin",
    name: "catppuccin-vsc",
    displayName: "Catppuccin",
    description: "Four pastel palettes, from Latte to Mocha.",
  },
];
export async function searchThemes(
  query: string,
  signal: AbortSignal,
): Promise<{ extensions: ThemePack[] }> {
  const params = new URLSearchParams({
    query,
    category: "Themes",
    size: "8",
    sortBy: "relevance",
    sortOrder: "desc",
  });
  return (await request(`${registry}/api/-/search?${params}`, signal)).json();
}
function json(text: string) {
  const errors: ParseError[] = [];
  const result = parse(text, errors, { allowTrailingComma: true });
  if (errors.length || !result || typeof result !== "object")
    throw new Error("This theme's color file could not be read.");
  return result;
}
function resolvePath(base: string, path: string) {
  const result = new URL(
    path.replaceAll("\\", "/"),
    `https://theme.invalid/${base}`,
  ).pathname.slice(1);
  if (!result.startsWith("extension/")) throw new Error("Unsupported theme file path.");
  return decodeURIComponent(result);
}
function hex(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  if (/^#[\da-f]{3}$/i.test(value)) return "#" + [...value.slice(1)].map((c) => c + c).join("");
  if (/^#[\da-f]{6}$/i.test(value)) return value;
  // Use opaque colors so imported controls stay readable against their new surfaces.
  if (/^#[\da-f]{8}$/i.test(value) && !value.endsWith("00")) return value.slice(0, 7);
}
export function mapColors(colors: Record<string, unknown>, mode: "dark" | "light"): Palette {
  const pick = (...keys: string[]) => keys.map((k) => hex(colors[k])).find(Boolean);
  const background = pick("editor.background") ?? (mode === "light" ? "#ffffff" : "#1e1e1e");
  const foreground =
    pick("editor.foreground", "foreground") ?? (mode === "light" ? "#333333" : "#d4d4d4");
  return {
    background,
    foreground,
    muted: pick("descriptionForeground", "editorLineNumber.foreground") ?? foreground,
    accent:
      pick("textLink.foreground", "focusBorder", "button.background", "terminal.ansiBlue") ??
      (mode === "light" ? "#005fb8" : "#75beff"),
    surface: pick("sideBar.background", "editorWidget.background") ?? background,
    hover: pick("list.hoverBackground", "list.inactiveSelectionBackground") ?? background,
    border:
      pick("panel.border", "widget.border", "editorGroup.border") ??
      (mode === "light" ? "#cccccc" : "#454545"),
    input: pick("input.background") ?? background,
  };
}
export async function loadThemePack(
  pack: ThemePack,
  signal: AbortSignal,
): Promise<CommunityTheme[]> {
  const meta = (await (
    await request(
      `${registry}/api/${encodeURIComponent(pack.namespace)}/${encodeURIComponent(pack.name)}`,
      signal,
    )
  ).json()) as { files?: { download?: string } };
  if (!meta.files?.download) throw new Error("This theme pack cannot be downloaded.");
  const download = new URL(meta.files?.download);
  if (download.origin !== registry || !download.pathname.endsWith(".vsix"))
    throw new Error("This theme pack cannot be downloaded.");
  const response = await request(download.href, signal);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("This theme pack could not be read.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 12_000_000) {
      await reader.cancel();
      throw new Error("This theme pack is too large. Try another theme.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let extracted = 0;
  const files = unzipSync(bytes, {
    filter: (file) => {
      if (!/\.jsonc?$/i.test(file.name)) return false;
      extracted += file.originalSize;
      if (file.originalSize > 2_000_000 || extracted > 16_000_000)
        throw new Error("This theme pack is too large. Try another theme.");
      return true;
    },
  });
  const read = (path: string) => {
    if (!files[path])
      throw new Error("This pack uses an unsupported theme format. Try another theme.");
    return json(strFromU8(files[path]));
  };
  const manifest = read("extension/package.json");
  const translations = files["extension/package.nls.json"]
    ? read("extension/package.nls.json")
    : {};
  const contributions = manifest.contributes?.themes;
  if (!Array.isArray(contributions)) throw new Error("This pack does not contain color themes.");
  function colorsFor(path: string, seen = new Set<string>()): Record<string, unknown> {
    if (seen.has(path) || seen.size > 10)
      throw new Error("This theme has unsupported color inheritance.");
    seen.add(path);
    const data = read(path);
    return {
      ...(typeof data.include === "string" ? colorsFor(resolvePath(path, data.include), seen) : {}),
      ...data.colors,
    };
  }
  const result: CommunityTheme[] = [];
  for (const item of contributions.slice(0, 100)) {
    try {
      if (typeof item.path !== "string") continue;
      const mode = item.uiTheme === "vs" || item.uiTheme === "hc-light" ? "light" : "dark";
      result.push({
        id: `${pack.namespace}.${pack.name}:${item.path}`,
        name: String(
          translations[String(item.label).replace(/^%|%$/g, "")] ??
            item.label ??
            item.id ??
            pack.displayName,
        ),
        source: `${pack.namespace}/${pack.name}`,
        mode,
        colors: mapColors(colorsFor(resolvePath("extension/package.json", item.path)), mode),
      });
    } catch {
      /* A pack can mix supported JSON themes and unsupported legacy themes. */
    }
  }
  if (!result.length) throw new Error("No supported color themes in this pack. Try another theme.");
  return result;
}
