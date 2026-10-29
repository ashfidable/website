import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const themeNames = [
  "dark",
  "light",
  "dusk",
  "forest",
  "ember",
  "halloween",
  "ocean",
  "rose",
  "mint",
  "lavender",
  "peach",
  "meadow",
  "sand",
] as const;
export type ThemeName = (typeof themeNames)[number];
export const themeLabels: Record<ThemeName, string> = {
  dark: "Circuit Dark",
  light: "Paper Light",
  dusk: "Violet Dusk",
  forest: "Deep Forest",
  ember: "Warm Ember",
  halloween: "Spooky Halloween",
  ocean: "Clear Ocean",
  rose: "Soft Rose",
  mint: "Alpine Mint",
  lavender: "Lavender Sky",
  peach: "Peach Horizon",
  meadow: "Sunny Meadow",
  sand: "Golden Sand",
};

type Settings = {
  theme: ThemeName;
  rounded: boolean;
  sound: boolean;
  hideSpoilers: boolean;
  shortcuts: boolean;
};
type SettingsContextValue = Settings & {
  changeTheme: (theme: ThemeName) => void;
  toggleRounded: () => void;
  toggleSound: () => void;
  toggleSpoilers: () => void;
  toggleShortcuts: () => void;
};

const defaults: Settings = {
  theme: "dark",
  rounded: true,
  sound: true,
  hideSpoilers: true,
  shortcuts: true,
};
const SettingsContext = createContext<SettingsContextValue | null>(null);

function readSettings(): Settings {
  if (typeof window === "undefined") return defaults;
  try {
    const saved = localStorage.getItem("settings");
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<Settings>;
      return {
        ...defaults,
        rounded: parsed.rounded ?? defaults.rounded,
        sound: parsed.sound ?? defaults.sound,
        hideSpoilers: parsed.hideSpoilers ?? defaults.hideSpoilers,
        shortcuts: parsed.shortcuts ?? defaults.shortcuts,
        theme: themeNames.includes(parsed.theme as ThemeName)
          ? (parsed.theme as ThemeName)
          : defaults.theme,
      };
    }
  } catch {}
  return {
    ...defaults,
    theme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaults,
  }));

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const saved = readSettings();
    setSettings(saved);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.rounded = String(settings.rounded);
    try {
      localStorage.setItem("settings", JSON.stringify(settings));
    } catch {
      // Preferences still work for this session when browser storage is unavailable.
    }
  }, [settings, loaded]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      changeTheme: (theme) => setSettings((current) => ({ ...current, theme })),
      toggleRounded: () => setSettings((current) => ({ ...current, rounded: !current.rounded })),
      toggleSound: () => setSettings((current) => ({ ...current, sound: !current.sound })),
      toggleShortcuts: () =>
        setSettings((current) => ({ ...current, shortcuts: !current.shortcuts })),
      toggleSpoilers: () =>
        setSettings((current) => ({ ...current, hideSpoilers: !current.hideSpoilers })),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useSettings must be used inside SettingsProvider");
  return value;
}
