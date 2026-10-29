import { HeadContent, Outlet, Scripts, createRootRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { TerminalShell } from "@/components/terminal/shell";
import { HalloweenBackground } from "@/components/halloween-background";
import { QueryProvider } from "@/providers/query-provider";
import { SettingsProvider, useSettings } from "@/providers/settings-provider";
import { playAudio } from "@/utils/play-audio";
import appCss from "../styles/globals.css?url";

const settingsScript = `(function(){try{var t=['dark','light','dusk','forest','ember','halloween','ocean','rose','mint','lavender','peach','meadow','sand'];var d={theme:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',rounded:true,sound:true,hideSpoilers:true};var s=localStorage.getItem('settings');if(s)d=Object.assign(d,JSON.parse(s));if(t.indexOf(d.theme)<0)d.theme='dark';document.documentElement.dataset.theme=d.theme;document.documentElement.dataset.rounded=String(d.rounded)}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.dataset.rounded='true'}})()`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "generator", content: "TanStack Start" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/images/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/images/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/images/favicon-16x16.png" },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "sitemap", href: "/sitemap-index.xml" },
    ],
  }),
  component: App,
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div className="p-8">
      <title>Page not found | Ashfid</title>
      <h1 className="text-2xl font-bold text-site-heading">Page not found</h1>
      <a href="/" className="underline">
        Return home
      </a>
    </div>
  ),
});

function App() {
  return (
    <QueryProvider>
      <NavigationSound />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex h-full min-h-0 min-w-0 flex-col text-base"
      >
        <div data-page-content className="flex min-h-0 flex-col px-4">
          <TerminalShell>
            <Outlet />
          </TerminalShell>
        </div>
      </main>
    </QueryProvider>
  );
}

function NavigationSound() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const { sound } = useSettings();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === previousPathname.current) return;
    previousPathname.current = pathname;
    if (!document.startViewTransition) return;
    playAudio("/audio/sound_toggle_on.mp3", sound);
  }, [pathname, sound]);

  return null;
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <Document>{children}</Document>
    </SettingsProvider>
  );
}

function Document({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-rounded="true"
      data-terminal="true"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsScript }} />
        <HeadContent />
      </head>
      <body className="min-h-screen w-full text-site-foreground">
        <HalloweenBackground />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-site-card focus:p-3 focus:text-site-heading focus:outline-2 focus:outline-site-ring"
        >
          Skip to content
        </a>
        <div data-site-shell data-chrome="app" className="mx-auto w-full">
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  );
}
