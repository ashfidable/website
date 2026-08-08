import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import spriteSheet from "$assets/images/ashfid_pixel_sheet.png";
import { site } from "$content/index";
import { highlightedText } from "$utils/string-formatter";

export function Sprite({ pixelScale = 3.5 }: { pixelScale?: number | string }) {
  return (
    <div
      className="character group mx-auto rounded-md"
      style={{ "--pixel-size": Number(pixelScale) } as React.CSSProperties}
    >
      <img
        src={spriteSheet}
        width={960}
        alt="Ashfid"
        className="spritesheet group-hover:animate-[moveSpritesheet_1.5s_steps(var(--frames))_infinite]"
        loading="eager"
      />
    </div>
  );
}

export function Logo() {
  return (
    <Link to="/" className="group flex items-center justify-center font-site-heading text-base">
      <div className="mb-1">
        <Sprite pixelScale={1} />
      </div>
      <span className="text-effect text-2xl font-extrabold">{site.name}</span>
    </Link>
  );
}

export function HeroSection({
  title = "Title Here",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="space-y-2 rounded-md border border-b-4 border-site-border bg-site-card p-4 text-site-foreground"
      style={{ viewTransitionName: "route-header" }}
    >
      <h1 className="font-site-heading text-xl font-extrabold tracking-wider">{title}</h1>
      {children}
    </section>
  );
}

export function HomeHeroSection() {
  return (
    <section className="home-hero gap-2 [&>section>h1]:text-lg [&>section>p]:text-sm [&>section>p]:leading-relaxed">
      <HeroSection title="Hi there 👋🏼">
        <p className="font-bold">Welcome to my digital garden! 🌱</p>
        <p>
          I’m a Software Engineer and Programmer, and I’ve created this cozy corner to share my
          thoughts or tutorials, break down mechanics, and much more.{" "}
          <span className="font-semibold">
            Let&apos;s ditch the over-engineering and have some fun!
          </span>
        </p>
      </HeroSection>
      <Sprite />
    </section>
  );
}

export function SectionHeading({ title }: { title: string }) {
  const { firstWord, restWords } = highlightedText(title);
  return (
    <h2 className="font-site-heading text-xl font-semibold">
      <span className="font-bold text-site-heading">{firstWord}</span>
      <span>{restWords}</span>
    </h2>
  );
}
