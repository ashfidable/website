import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemeName = 'dark' | 'light'
type Settings = { theme: ThemeName; rounded: boolean; sound: boolean }
type SettingsContextValue = Settings & {
  changeTheme: (theme: ThemeName) => void
  toggleRounded: () => void
  toggleSound: () => void
}

const defaults: Settings = { theme: 'dark', rounded: true, sound: true }
const SettingsContext = createContext<SettingsContextValue | null>(null)

function readSettings(): Settings {
  if (typeof window === 'undefined') return defaults
  try {
    const saved = localStorage.getItem('settings')
    if (saved) return { ...defaults, ...JSON.parse(saved) }
  } catch {}
  return { ...defaults, theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults)

  useEffect(() => setSettings(readSettings()), [])
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.dataset.rounded = String(settings.rounded)
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [settings])

  const value = useMemo<SettingsContextValue>(() => ({
    ...settings,
    changeTheme: (theme) => setSettings((current) => ({ ...current, theme })),
    toggleRounded: () => setSettings((current) => ({ ...current, rounded: !current.rounded })),
    toggleSound: () => setSettings((current) => ({ ...current, sound: !current.sound })),
  }), [settings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used inside SettingsProvider')
  return value
}
