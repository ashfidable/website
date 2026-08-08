import { Link, useLocation, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { Icon } from './icon'
import { Logo } from './site'
import { Settings } from './settings'
import { StatusCard } from './status-card'
import { links, mobileLinks } from './navigation-links'
import { site, socialLinks } from '$content/index'

function isCurrent(pathname: string, url: string) {
  if (url === '/') return pathname === '/'
  return pathname === url || pathname.startsWith(`${url}/`)
}

function Footer() {
  return <footer className="mt-auto block w-full space-y-2 pt-2 md:p-4"><StatusCard /><a href={site.supportUrl} target="_blank" rel="noopener noreferrer" className="group flex w-full items-center justify-center rounded-md border-b-4 border-lime-700 bg-lime-500 px-3 py-2 font-site-heading text-sm font-semibold text-black outline-none transition-[background-color,border-color,transform,box-shadow] duration-150 ease-springy hover:-translate-y-0.5 hover:border-yellow-700 hover:bg-yellow-400 focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-2 focus-visible:ring-offset-site-page"><img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="" className="mr-2 h-5" /><span>Buy me a Coffee</span></a><section className="flex flex-wrap justify-center gap-2">{socialLinks.map((contact) => <a key={contact.name} href={contact.url} className="rounded-md bg-site-card p-2 text-site-icon outline-none transition-[background-color,color,transform,box-shadow] duration-150 ease-springy hover:-translate-y-0.5 hover:bg-site-button-hover hover:text-site-icon-hover focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-2 focus-visible:ring-offset-site-page"><span className="sr-only">{contact.name}</span><Icon name={contact.icon} className="text-2xl" /></a>)}</section></footer>
}

export function DesktopNavigation() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const pending = useRouterState({ select: (state) => state.status === 'pending' })
  return (
    <aside className="sticky top-0 hidden h-screen w-full flex-col border-x border-site-border md:flex">
      <nav><section className="hidden py-4 md:block"><Logo /></section><section className="flex flex-col justify-between gap-4 font-site-heading"><ul className="flex flex-grow flex-col gap-2 text-sm font-semibold tracking-wide">{links.map((link) => {
        const current = isCurrent(pathname, link.url)
        return <li key={link.url}><Link to={link.url as any} className="desktop-nav-link group block transition-transform duration-150" aria-current={current ? 'page' : undefined}>{current && <span aria-hidden="true" className="pointer-events-none absolute inset-0 border-r-4 border-site-border-hover" style={{ viewTransitionName: 'current-page' }} />}<div className="relative z-10 flex items-center gap-2 py-2 pl-4"><Icon name={link.icon} className="text-lg group-hover:text-site-icon-hover" /><span>{link.name}</span>{pending && current && <Icon name="svg-spinners:dot-revolve" className="ml-auto mr-4 h-4 w-4" />}</div></Link></li>
      })}</ul></section></nav>
      <Footer />
    </aside>
  )
}

export function MobileNavigation() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] flex h-20 gap-4 border-t border-site-border bg-site-page md:hidden">
      <ul className="grid h-full w-full grid-cols-4">{mobileLinks.map((link) => <li key={link.url}><Link to={link.url as any} className="mobile-nav-link group flex h-full flex-col items-center justify-center gap-2 aria-[current=page]:bg-site-button-active aria-[current=page]:font-bold" aria-current={isCurrent(pathname, link.url) ? 'page' : undefined}><Icon name={link.icon} className="text-2xl group-aria-[current=page]:text-site-icon-hover" /><span className="text-sm">{link.name}</span></Link></li>)}<li className="flex"><button className="group flex flex-grow flex-col items-center justify-center gap-2" onClick={() => setOpen(true)}><Icon name="mdi:menu" className="text-2xl group-hover:text-site-heading-hover" /><span className="text-sm">Menu</span></button></li></ul>
      {open && <div className="fixed inset-0 z-40"><button aria-label="Close menu" className="fixed inset-0 z-50 h-full w-full bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} /><div className="back-to-top-enter fixed inset-x-0 bottom-0 z-50 flex max-h-[calc(100dvh-1rem)] flex-col gap-4 overflow-y-auto rounded-t-md border-t border-site-border bg-site-page p-4"><Logo /><Settings /><section className="space-y-4"><ul className="grid grid-cols-3 grid-rows-2 gap-4">{links.map((link) => <li key={link.url}><Link to={link.url as any} onClick={() => setOpen(false)} className="group flex flex-col items-center justify-center gap-2 rounded-md bg-site-button p-4 text-base outline-none transition-[background-color,box-shadow] duration-150 hover:bg-site-button-hover focus-visible:ring-2 focus-visible:ring-site-ring aria-[current=page]:border-2 aria-[current=page]:bg-site-button-active aria-[current=page]:font-bold" aria-current={isCurrent(pathname, link.url) ? 'page' : undefined}><Icon name={link.icon} className="text-xl group-aria-[current=page]:text-site-icon-hover" />{link.name}</Link></li>)}</ul></section><Footer /></div></div>}
    </nav>
  )
}
