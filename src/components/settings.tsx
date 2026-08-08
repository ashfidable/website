import { useEffect, useId, useRef, useState } from 'react'
import { Palette, Radius, Square, Volume2, VolumeX } from 'lucide-react'
import { themeNames, useSettings, type ThemeName } from '@/providers/settings-provider'
import { Icon } from './icon'

const themeLabels: Record<ThemeName, string> = {
  dark: 'Circuit Dark',
  light: 'Paper Light',
  dusk: 'Violet Dusk',
  forest: 'Deep Forest',
  ember: 'Warm Ember',
  ocean: 'Clear Ocean',
  rose: 'Soft Rose',
  mint: 'Alpine Mint',
  lavender: 'Lavender Sky',
  peach: 'Peach Horizon',
  meadow: 'Sunny Meadow',
  sand: 'Golden Sand',
}

function play(url: string, enabled = true) {
  if (!enabled) return
  const audio = new Audio(url)
  audio.volume = 0.2
  void audio.play().catch(() => {})
}

const controlClass =
  'grid h-10 w-10 place-items-center rounded-md bg-site-button text-site-icon outline-none transition-[background-color,color,transform,box-shadow] duration-150 ease-springy hover:-translate-y-0.5 hover:bg-site-button-hover hover:text-site-icon-hover active:translate-y-0 focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-2 focus-visible:ring-offset-site-page md:h-8 md:w-8 md:bg-site-card'

export function Settings() {
  const settings = useSettings()
  const [themesOpen, setThemesOpen] = useState(false)
  const themePickerRef = useRef<HTMLDivElement>(null)
  const themePickerId = useId()

  useEffect(() => {
    if (!themesOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!themePickerRef.current?.contains(event.target as Node)) setThemesOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setThemesOpen(false)
    }

    window.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [themesOpen])

  return (
    <div
      ref={themePickerRef}
      role="toolbar"
      aria-label="Site preferences"
      className="relative flex flex-wrap items-center gap-2 rounded-md py-4 text-2xl md:flex-nowrap md:py-0 md:text-xl"
    >
      <button
        type="button"
        className={`${controlClass} ${settings.sound ? 'bg-site-button-active text-site-icon-hover' : ''}`}
        onClick={() => {
          settings.toggleSound()
          play('/audio/sound_toggle_on.mp3')
        }}
        aria-label={settings.sound ? 'Mute interface sounds' : 'Enable interface sounds'}
        aria-pressed={settings.sound}
        title={settings.sound ? 'Mute sounds' : 'Enable sounds'}
      >
        {settings.sound ? <Volume2 className="h-[1em] w-[1em]" /> : <VolumeX className="h-[1em] w-[1em]" />}
      </button>

      <button
        type="button"
        className={`${controlClass} ${settings.rounded ? 'bg-site-button-active text-site-icon-hover' : ''}`}
        onClick={() => {
          settings.toggleRounded()
          play('/audio/sound_toggle_on.mp3', settings.sound)
        }}
        aria-label={settings.rounded ? 'Use square corners' : 'Use rounded corners'}
        aria-pressed={settings.rounded}
        title={settings.rounded ? 'Use square corners' : 'Use rounded corners'}
      >
        {settings.rounded ? <Radius className="h-[1em] w-[1em]" /> : <Square className="h-[1em] w-[1em]" />}
      </button>

      <button
        type="button"
        className={`${controlClass} ${themesOpen ? 'bg-site-button-active text-site-icon-hover' : ''}`}
        onClick={() => {
          setThemesOpen((open) => !open)
          play('/audio/fly_in_out.mp3', settings.sound)
        }}
        aria-label="Choose color theme"
        aria-expanded={themesOpen}
        aria-controls={themePickerId}
        title="Choose color theme"
      >
        <Palette className="h-[1em] w-[1em]" />
      </button>

      {themesOpen && (
        <div
          id={themePickerId}
          role="menu"
          aria-label="Color themes"
          className="back-to-top-enter z-50 order-last mt-2 max-h-[calc(100vh-6rem)] w-80 overflow-y-auto rounded-md border border-site-border bg-site-card p-2 shadow-2xl md:absolute md:bottom-auto md:left-auto md:right-0 md:top-full md:mt-2"
        >
          <div className="border-b border-site-border px-2 pb-2 pt-1">
            <p className="font-site-heading text-sm font-bold text-site-foreground">Choose a theme</p>
            <p className="mt-0.5 text-xs text-site-muted">Your preference is saved on this device.</p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {themeNames.map((theme) => {
              const selected = settings.theme === theme
              return (
                <button
                  key={theme}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className={`flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors duration-150 hover:bg-site-button-hover focus-visible:ring-2 focus-visible:ring-site-ring ${selected ? 'bg-site-button-active font-semibold text-site-active-foreground' : 'text-site-foreground'}`}
                  onClick={() => {
                    settings.changeTheme(theme)
                    setThemesOpen(false)
                    play('/audio/sound_toggle_on.mp3', settings.sound)
                  }}
                >
                  <span
                    data-theme={theme}
                    className="h-5 w-5 shrink-0 rounded-full border border-site-border bg-gradient-to-br from-[var(--color-theme-primary)] from-50% to-[var(--color-theme-secondary)] to-50%"
                    aria-hidden="true"
                  />
                  <span className="truncate">{themeLabels[theme]}</span>
                  {selected && <Icon name="mdi:check-bold" className="ml-auto shrink-0 text-site-icon-hover" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
