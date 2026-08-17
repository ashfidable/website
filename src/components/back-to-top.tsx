import { useEffect, useState } from "react";
import { Icon } from "./icon";

export function BackToTop({ showThreshold = 500 }: { showThreshold?: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(document.documentElement.scrollTop > showThreshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showThreshold]);

  if (!show) return null;

  return (
    <button
      type="button"
      className="back-to-top-enter fixed bottom-20 right-3 z-40 grid h-10 w-10 place-items-center rounded-md border border-site-border bg-site-surface/90 text-site-muted shadow-sm backdrop-blur-md outline-none transition-[background-color,color,transform] duration-150 hover:-translate-y-0.5 hover:bg-site-card-hover hover:text-site-heading active:translate-y-0 focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-2 focus-visible:ring-offset-site-page md:bottom-5 md:right-5"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      title="Back to top"
    >
      <Icon name="mdi:arrow-up" className="text-lg" />
    </button>
  );
}
