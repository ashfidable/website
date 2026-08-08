import { Link, useLocation, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { Icon } from './icon'
import { Logo } from './site'
import { Settings } from './settings'
import { StatusCard } from './status-card'
import { links, mobileLinks } from './navigation-links'

function isCurrent(pathname: string, url: string) {
  if (url === '/') return pathname === '/'
  return pathname === url || pathname.startsWith(`${url}/`)
}

function Footer() {
  const contacts = [
    { name: 'Email', icon: 'mdi:email-fast', link: 'mailto:imashfid@gmail.com' },
    { name: 'GitHub', icon: 'mdi:github', link: 'https://github.com/ashfidable' },
    { name: 'RSS', icon: 'mdi:rss', link: '/rss.xml' },
  ]
  return <footer className="mt-auto block w-full pt-2 md:p-4"><StatusCard /><section className="flex flex-wrap justify-center gap-2">{contacts.map((contact) => <a key={contact.name} href={contact.link} className="rounded-md bg-site-card p-2 text-site-icon outline-2 outline-site-border-hover transition-[outline] duration-100 ease-springy hover:bg-site-button-hover hover:text-site-icon-hover hover:outline"><span className="sr-only">{contact.name}</span><Icon name={contact.icon} className="text-2xl" /></a>)}</section></footer>
}

export function DesktopNavigation() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const pending = useRouterState({ select: (state) => state.status === 'pending' })
  return (
    <aside className="sticky top-0 hidden h-screen w-full flex-col border-x border-site-border md:flex">
      <nav><section className="hidden py-4 md:block"><Logo /></section><section className="flex flex-col justify-between gap-4 font-site-heading"><ul className="flex flex-grow flex-col gap-2 text-sm font-semibold tracking-wide">{links.map((link) => <li key={link.url}><Link to={link.url as any} viewTransition className="desktop-nav-link group block transition-transform duration-150" aria-current={isCurrent(pathname, link.url) ? 'page' : undefined}><div className="flex items-center gap-2 py-2 pl-4"><Icon name={link.icon} className="text-lg group-hover:text-site-icon-hover" /><span>{link.name}</span>{pending && isCurrent(pathname, link.url) && <Icon name="svg-spinners:dot-revolve" className="ml-auto mr-4 h-4 w-4" />}</div></Link></li>)}</ul></section></nav>
      <Footer />
    </aside>
  )
}

export function MobileNavigation() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] flex h-20 gap-4 border-t border-site-border bg-site-page md:hidden" style={{ viewTransitionName: 'mobile-navigation' }}>
      <ul className="grid h-full w-full grid-cols-4">{mobileLinks.map((link) => <li key={link.url}><Link to={link.url as any} viewTransition className="mobile-nav-link group flex h-full flex-col items-center justify-center gap-2 aria-[current=page]:bg-site-button-active aria-[current=page]:font-bold" aria-current={isCurrent(pathname, link.url) ? 'page' : undefined}><Icon name={link.icon} className="text-2xl group-aria-[current=page]:text-site-icon-hover" /><span className="text-sm">{link.name}</span></Link></li>)}<li className="flex"><button className="group flex flex-grow flex-col items-center justify-center gap-2" onClick={() => setOpen(true)}><Icon name="mdi:menu" className="text-2xl group-hover:text-site-heading-hover" /><span className="text-sm">Menu</span></button></li></ul>
      {open && <div className="fixed inset-0 z-40"><button aria-label="Close menu" className="fixed inset-0 z-50 h-full w-full bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} /><div className="back-to-top-enter fixed inset-x-0 bottom-0 z-50 flex flex-col gap-4 rounded-t-md border-t border-site-border bg-site-page p-4"><Logo /><Settings /><section className="space-y-4"><ul className="grid grid-cols-3 grid-rows-2 gap-4">{links.map((link) => <li key={link.url}><Link to={link.url as any} viewTransition onClick={() => setOpen(false)} className="group flex flex-col items-center justify-center gap-2 rounded-md bg-site-button p-4 text-base outline-2 outline-site-border transition-colors duration-150 hover:outline active:outline aria-[current=page]:border-2 aria-[current=page]:bg-site-button-active aria-[current=page]:font-bold" aria-current={isCurrent(pathname, link.url) ? 'page' : undefined}><Icon name={link.icon} className="text-xl group-aria-[current=page]:text-site-icon-hover" />{link.name}</Link></li>)}</ul></section><Footer /></div></div>}
    </nav>
  )
}
