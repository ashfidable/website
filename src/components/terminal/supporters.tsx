import { useEffect, useRef, useState } from "react";
import supporters from "$content/supporters.json";
import { site } from "$content/index";
import { focusRing } from "./data";

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const total = dollars(supporters.reduce((sum, supporter) => sum + supporter.amountCents, 0));

function SupporterTotal() {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(total);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let generation = 0;
    let visible = false;

    const stop = () => {
      generation++;
      cancelAnimationFrame(frame);
      setDisplay(total);
    };
    const start = async () => {
      stop();
      if (motion.matches) return;
      const current = generation;
      // The terminal reveals command output on a delay. Wait until it is visible.
      const reveal = element.closest(".fade-in-late");
      await Promise.allSettled(
        (reveal?.getAnimations() ?? []).map((animation) => animation.finished),
      );
      if (current !== generation || !visible || motion.matches) return;

      let started: number | undefined;
      let lastUpdate = -Infinity;
      const digits = total.replace(/\D/g, "").length;
      const tick = (now: number) => {
        started ??= now;
        const progress = Math.min((now - started) / 850, 1);
        if (progress === 1) {
          setDisplay(total);
          return;
        }
        if (now - lastUpdate >= 50) {
          lastUpdate = now;
          let digit = 0;
          setDisplay(
            total.replace(/\d/g, (value) =>
              digit++ < Math.floor(progress * digits)
                ? value
                : String(Math.floor(Math.random() * 10)),
            ),
          );
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        if (nextVisible === visible) return;
        visible = nextVisible;
        if (visible) void start();
        else stop();
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(element);
    const onMotionChange = () => {
      if (motion.matches) stop();
    };
    motion.addEventListener("change", onMotionChange);
    return () => {
      generation++;
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div ref={ref} className="mt-2 flex items-baseline gap-3 border-t border-site-muted/30 pt-2">
      <dt className="text-site-heading">total</dt>
      <dd className="ml-auto font-semibold tabular-nums text-site-heading">
        <span className="sr-only">{total}</span>
        <span aria-hidden="true">{display}</span>
      </dd>
    </div>
  );
}

export function Supporters() {
  return (
    <div className="max-w-sm">
      <p className="text-site-heading">Thanks for the coffee.</p>
      {supporters.length > 0 && (
        <dl className="mt-4 grid gap-1">
          {supporters.map(({ name, amountCents }) => (
            <div key={name} className="flex items-baseline gap-3">
              <dt className="min-w-0 [overflow-wrap:anywhere]">{name}</dt>
              <span
                aria-hidden="true"
                className="min-w-4 flex-1 border-b border-dotted border-site-muted/50"
              />
              <dd className="tabular-nums text-site-muted">{dollars(amountCents)}</dd>
            </div>
          ))}
          <SupporterTotal />
        </dl>
      )}
      <p className="mt-4 text-sm text-site-muted">
        Plus everyone who gave anonymously.{" "}
        <a
          href={site.supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded text-site-heading underline decoration-site-heading/40 underline-offset-4 hover:text-site-heading-hover ${focusRing}`}
        >
          Buy me a coffee <span aria-hidden="true">↗</span>
        </a>
      </p>
    </div>
  );
}
