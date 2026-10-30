export const paletteKeys = [
  "background",
  "foreground",
  "muted",
  "accent",
  "surface",
  "hover",
  "border",
  "input",
] as const;
export type Palette = Record<(typeof paletteKeys)[number], string>;
export type CommunityTheme = {
  id: string;
  name: string;
  source: string;
  mode: "dark" | "light";
  colors: Palette;
};
export const themeVariables: Record<string, keyof Palette> = {
  background: "background",
  "background-body": "background",
  "theme-primary": "background",
  "body-text": "foreground",
  icon: "foreground",
  "blockquote-text": "foreground",
  "body-text-low-contrast": "muted",
  "heading-text": "accent",
  "heading-text-hover": "accent",
  "theme-secondary": "accent",
  link: "accent",
  "link-hover": "accent",
  "card-date-text": "accent",
  "border-highlight": "border",
  "border-highlight-hover": "accent",
  "input-ring-focus": "accent",
  "input-ring-normal": "border",
  "input-accent": "accent",
  "input-background": "input",
  "button-normal": "surface",
  "button-active": "hover",
  "button-hover": "hover",
  "button-text-active": "accent",
  "card-background": "surface",
  "card-background-hover": "hover",
  "code-background": "surface",
  "icon-hover": "accent",
  "blockquote-indicator": "accent",
  "blockquote-background": "surface",
  "spotify-progress": "accent",
  "spotify-progress-background": "surface",
  "gradient-from": "accent",
  "gradient-to": "accent",
  "category-background": "surface",
  "category-text": "foreground",
  "category-highlight": "border",
};
export function isCommunityTheme(value: unknown): value is CommunityTheme {
  if (!value || typeof value !== "object") return false;
  const t = value as CommunityTheme;
  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    typeof t.source === "string" &&
    (t.mode === "dark" || t.mode === "light") &&
    !!t.colors &&
    paletteKeys.every(
      (key) => typeof t.colors[key] === "string" && /^#[\da-f]{6}$/i.test(t.colors[key]),
    )
  );
}
export function applyCommunityTheme(theme: CommunityTheme | null) {
  const root = document.documentElement;
  for (const [variable, key] of Object.entries(themeVariables)) {
    if (theme) root.style.setProperty(`--color-${variable}`, theme.colors[key]);
    else root.style.removeProperty(`--color-${variable}`);
  }
  if (theme) {
    root.style.setProperty("--color-background-image", "none");
    root.style.colorScheme = theme.mode;
  } else {
    root.style.removeProperty("--color-background-image");
    root.style.removeProperty("color-scheme");
  }
}
