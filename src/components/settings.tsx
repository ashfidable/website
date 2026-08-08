import { useState } from 'react'
import { useSettings, type ThemeName } from '@/providers/settings-provider'

const themes: ThemeName[] = ['dark', 'light']

function play(url: string, enabled = true) {
  if (!enabled) return
  const audio = new Audio(url)
  audio.volume = 0.2
  void audio.play().catch(() => {})
}

export function Settings() {
  const settings = useSettings()
  const [expanded, setExpanded] = useState(false)
  const buttonClass = 'rounded-md bg-site-button p-2 transition-colors duration-200 ease-springy hover:bg-site-button-hover active:bg-site-button-active md:bg-site-card'

  return (
    <div className="flex items-center gap-4 rounded-md py-4 text-2xl md:py-0 md:text-xl">
      <div className="flex items-center gap-2">
        <button className={`${buttonClass} ${settings.sound ? 'text-site-active-foreground' : ''}`} onClick={() => { settings.toggleSound(); play('/audio/sound_toggle_on.mp3') }} aria-pressed={settings.sound}>
          <span className="sr-only">Sounds</span>
          <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d={settings.sound ? 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77s-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9z' : 'M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9'} /></svg>
        </button>
        <button className={`${buttonClass} ${settings.rounded ? 'text-site-active-foreground' : ''}`} onClick={() => { settings.toggleRounded(); play('/audio/sound_toggle_on.mp3', settings.sound) }} aria-pressed={settings.rounded}>
          <span className="sr-only">Rounded corners</span>
          <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d={settings.rounded ? 'M8 3h8c2.76 0 5 2.24 5 5v8c0 2.76-2.24 5-5 5H8c-2.76 0-5-2.24-5-5V8c0-2.76 2.24-5 5-5m0 2C6.34 5 5 6.34 5 8v8c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V8c0-1.66-1.34-3-3-3z' : 'M3 3h18v18H3zm2 2v14h14V5z'} /></svg>
        </button>
        <button className={`${buttonClass} ${expanded ? 'text-site-active-foreground' : ''}`} onClick={() => { setExpanded((value) => !value); play('/audio/fly_in_out.mp3', settings.sound) }} aria-expanded={expanded}>
          <span className="sr-only">Themes</span>
          <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m19.228 18.732l1.767-1.767l1.768 1.767a2.5 2.5 0 1 1-3.535 0M8.878 1.08l11.314 11.313a1 1 0 0 1 0 1.415l-8.485 8.485a1 1 0 0 1-1.414 0l-8.485-8.485a1 1 0 0 1 0-1.415l7.778-7.778l-2.122-2.121zM11 6.03L3.929 13.1H18.07z" /></svg>
        </button>
      </div>
      <div className={`flex w-full gap-2 overflow-hidden transition-all duration-75 ease-in-out ${expanded ? 'md:w-16' : 'md:w-0'}`}>
        {expanded && themes.map((theme, index) => <button key={theme} data-theme={theme} aria-label={`${theme} theme`} aria-pressed={settings.theme === theme} className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-r from-[var(--color-theme-primary)] from-65% to-[var(--color-theme-secondary)] to-50% outline-2 outline-site-border aria-pressed:outline-site-border-hover aria-pressed:outline-offset-2" style={{ animation: `panel-in 150ms ease-out ${75 * index}ms both` }} onClick={() => settings.changeTheme(theme)} />)}
      </div>
    </div>
  )
}
