import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { CommandPalette } from '@/components/command-palette'
import { DesktopNavigation, MobileNavigation } from '@/components/navigation'
import { Settings } from '@/components/settings'
import { SettingsProvider } from '@/providers/settings-provider'
import appCss from '../styles/globals.css?url'

const settingsScript = `(function(){try{var d={theme:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',rounded:true,sound:true};var s=localStorage.getItem('settings');if(s)d=Object.assign(d,JSON.parse(s));document.documentElement.dataset.theme=d.theme;document.documentElement.dataset.rounded=String(d.rounded)}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.dataset.rounded='true'}})()`

export const Route = createRootRoute({
  head: () => ({
    meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { name: 'generator', content: 'TanStack Start' }],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/images/favicon-16x16.png' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'sitemap', href: '/sitemap-index.xml' },
    ],
  }),
  component: App,
  shellComponent: RootDocument,
  notFoundComponent: () => <div className="p-8"><h1 className="text-2xl font-bold text-site-heading">Page not found</h1><a href="/" className="underline">Return home</a></div>,
})

function App() {
  return <SettingsProvider><DesktopNavigation /><MobileNavigation /><main className="flex h-full flex-grow flex-col gap-4 text-base md:border-r md:border-site-border"><div className="hidden items-center justify-between border-b-2 border-site-border bg-site-card px-4 py-2 text-sm md:flex"><CommandPalette /><Settings /></div><div className="flex flex-col gap-8 px-4 pb-4 pt-4 md:px-4 md:pt-0"><Outlet /></div></main></SettingsProvider>
}

function RootDocument({ children }: { children: ReactNode }) {
  return <html lang="en" data-theme="dark" data-rounded="true" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: settingsScript }} /><HeadContent /></head><body className="mx-auto mb-20 min-h-screen max-w-6xl bg-site-page text-site-foreground md:mb-auto md:grid md:grid-cols-[14rem_1fr]">{children}<Scripts /></body></html>
}
