import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import spriteSheet from '$assets/images/ashfid_pixel_sheet.png'
import { highlightedText } from '$utils/string-formatter'

export function Sprite({ pixelScale = 3.5 }: { pixelScale?: number | string }) {
  return (
    <div className="character group mx-auto rounded-md" style={{ '--pixel-size': Number(pixelScale) } as React.CSSProperties}>
      <img src={spriteSheet} width={960} alt="Ashfid" className="spritesheet group-hover:animate-[moveSpritesheet_1.5s_steps(var(--frames))_infinite]" loading="eager" />
    </div>
  )
}

export function Logo() {
  return (
    <Link to="/" className="group flex items-center justify-center font-site-heading text-base">
      <div className="mb-1"><Sprite pixelScale={1} /></div>
      <span className="text-effect text-2xl font-extrabold">ASHFID.</span>
    </Link>
  )
}

export function HeroSection({ title = 'Title Here', children }: { title?: string; children: ReactNode }) {
  return (
    <section className="space-y-2 rounded-md border border-b-4 border-site-border bg-site-card p-4 text-site-foreground">
      <h1 className="font-site-heading text-xl font-extrabold tracking-wider">{title}</h1>
      {children}
    </section>
  )
}

export function HomeHeroSection() {
  return (
    <section className="flex flex-col-reverse items-center gap-2 md:two-column-layout md:items-stretch">
      <HeroSection title="Hi there 👋🏼">
        <p className="font-bold">Welcome to my digital garden! 🌱</p>
        <p>I’m a Software Engineer and Programmer, and I’ve created this cozy corner to share my thoughts or tutorials, break down mechanics, and much more. <span className="font-semibold">Let&apos;s ditch the over-engineering and have some fun!</span></p>
        <div className="flex justify-center pt-2 md:justify-end">
          <a href="https://www.buymeacoffee.com/ashfid" target="_blank" rel="noopener noreferrer" className="group inline-flex transform items-center rounded-lg border-b-4 border-lime-700 bg-lime-500 px-4 py-2 font-site-heading font-medium text-black transition-all duration-200 hover:scale-105 hover:border-yellow-700 hover:bg-yellow-400 hover:shadow-lg">
            <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Buy me a Coffee" className="mr-2 h-6 group-hover:animate-bounce" />
            <span>Buy me a Coffee</span>
          </a>
        </div>
      </HeroSection>
      <Sprite />
    </section>
  )
}

export function SectionHeading({ title }: { title: string }) {
  const { firstWord, restWords } = highlightedText(title)
  return <h2 className="font-site-heading text-xl font-semibold"><span className="font-bold text-site-heading">{firstWord}</span><span>{restWords}</span></h2>
}
