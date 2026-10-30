import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { site } from "$content/index";
import { Icon } from "./icon";

type Preview = { title?: string; description?: string; image?: string; favicon?: string };
type Previews = Record<string, Preview>;
type Target = { url: string; host: string; rect: DOMRect };
type CardState = { open: boolean; target: Target | null; leaving: Target | null };

const OPEN_DELAY = 250;
const MORPH_DELAY = 70;
const CLOSE_DELAY = 150;
const VIEWPORT_GAP = 8;

const siteHost = new URL(site.url).host;

export function isExternalLink(href?: string) {
  return !!href && /^https?:\/\//i.test(href) && new URL(href).host !== siteHost;
}

let manifest: Promise<Previews> | undefined;

/** Fetched once on first hover, so posts never pay for previews nobody asks for. */
function loadPreviews() {
  manifest ??= fetch("/link-previews.json")
    .then((response) => (response.ok ? (response.json() as Promise<Previews>) : {}))
    .catch(() => {
      manifest = undefined;
      return {};
    });
  return manifest;
}

function targetFor(link: HTMLAnchorElement, x?: number, y?: number): Target {
  const url = new URL(link.href);
  url.hash = "";
  // A link wrapped across lines has one rect per line; anchor to the one under the pointer.
  const rects = [...link.getClientRects()];
  const rect =
    rects.find((item) => x !== undefined && y !== undefined && y >= item.top && y <= item.bottom) ??
    link.getBoundingClientRect();
  return { url: url.href, host: url.host.replace(/^www\./, ""), rect };
}

function linkFrom(target: EventTarget | null) {
  return target instanceof Element
    ? target.closest<HTMLAnchorElement>("a[data-external-link]")
    : null;
}

function PreviewContent({ target, preview }: { target: Target; preview?: Preview }) {
  const { title, description, image, favicon } = preview ?? {};
  return (
    <>
      {image && (
        <img
          src={image}
          alt=""
          width={640}
          height={335}
          decoding="async"
          className="aspect-[640/335] h-auto w-full border-b border-site-border bg-site-card-hover object-cover"
        />
      )}
      <div className="space-y-1 p-3">
        {title && <p className="line-clamp-2 font-bold text-site-heading">{title}</p>}
        {description && <p className="line-clamp-3 text-xs text-site-muted">{description}</p>}
        <p className="flex items-center gap-1.5 text-xs text-site-muted">
          {favicon ? (
            <img src={favicon} alt="" width={16} height={16} className="size-4 rounded-sm" />
          ) : (
            <Icon name="ri:external-link-line" className="shrink-0" />
          )}
          <span className="truncate">{target.host}</span>
        </p>
      </div>
    </>
  );
}

/**
 * One card and one set of delegated listeners for a whole post, however many links it has.
 * The card stays mounted so it can fade out and glide between links; the motion lives in
 * animations.css. Touch input is ignored: tapping just follows the link.
 */
export function LinkPreviews({ container }: { container: RefObject<HTMLElement | null> }) {
  const [{ open, target, leaving }, setCard] = useState<CardState>({
    open: false,
    target: null,
    leaving: null,
  });
  const [previews, setPreviews] = useState<Previews | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const schedule = (action: () => void, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(action, delay);
  };
  const hide = () => setCard((state) => ({ ...state, open: false, leaving: null }));
  const close = () => schedule(hide, CLOSE_DELAY);
  const clearLeaving = () => setCard((state) => ({ ...state, leaving: null }));

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const show = (link: HTMLAnchorElement, x?: number, y?: number) => {
      const next = targetFor(link, x, y);
      // Still on screen, even if fading out, so the new link morphs rather than reopens.
      const visible = (card.current?.offsetHeight ?? 0) > 0;
      setCard((state) => ({
        open: true,
        target: next,
        leaving: visible && state.target?.url !== next.url ? state.target : state.leaving,
      }));
    };
    const start = (link: HTMLAnchorElement, x?: number, y?: number) => {
      void loadPreviews().then((loaded) => {
        setPreviews(loaded);
        const image = loaded[targetFor(link).url]?.image;
        if (image) new Image().src = image;
      });
      const delay = (card.current?.offsetHeight ?? 0) > 0 ? MORPH_DELAY : OPEN_DELAY;
      schedule(() => show(link, x, y), delay);
    };
    const onPointerOver = (event: PointerEvent) => {
      const link = linkFrom(event.target);
      if (link && event.pointerType === "mouse" && linkFrom(event.relatedTarget) !== link) {
        start(link, event.clientX, event.clientY);
      }
    };
    const onPointerOut = (event: PointerEvent) => {
      const link = linkFrom(event.target);
      if (link && event.pointerType === "mouse" && linkFrom(event.relatedTarget) !== link) close();
    };
    const onFocusIn = (event: FocusEvent) => {
      const link = linkFrom(event.target);
      if (link?.matches(":focus-visible")) start(link);
    };
    const onFocusOut = (event: FocusEvent) => {
      if (linkFrom(event.target)) close();
    };
    const onClick = (event: MouseEvent) => {
      if (!linkFrom(event.target)) return;
      clearTimeout(timer.current);
      hide();
    };

    root.addEventListener("pointerover", onPointerOver);
    root.addEventListener("pointerout", onPointerOut);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    root.addEventListener("click", onClick);
    return () => {
      clearTimeout(timer.current);
      root.removeEventListener("pointerover", onPointerOver);
      root.removeEventListener("pointerout", onPointerOut);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      root.removeEventListener("click", onClick);
    };
  }, [container]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    // The card lets the pointer through so it can't block the next link in a list, which
    // means it can't see hover itself. Holding it open is done by position instead.
    let insideCard = false;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !card.current) return;
      const rect = card.current.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!linkFrom(event.target)) {
        if (inside) clearTimeout(timer.current);
        else if (insideCard) close();
      }
      insideCard = inside;
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", hide);
    // Capturing catches the terminal panel, which scrolls instead of the window.
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", hide);
      window.removeEventListener("scroll", hide, { capture: true });
    };
  }, [open]);

  useLayoutEffect(() => {
    const element = card.current;
    if (!element || !target) return;
    if (!open) {
      delete element.dataset.open;
      void Promise.allSettled(element.getAnimations().map((item) => item.finished)).then(() => {
        if (!element.dataset.open && element.matches(":popover-open")) element.hidePopover();
      });
      return;
    }

    // Zero when the card is fully closed, which skips the height morph.
    const fromHeight = element.offsetHeight;
    const reopening = fromHeight > 0;
    if (!element.matches(":popover-open")) element.showPopover();
    // A fresh open starts at its link, so only moves between links get to glide.
    if (!reopening) element.style.transition = "none";
    element.style.height = "auto";
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    const below = target.rect.bottom + VIEWPORT_GAP;
    const fitsBelow = below + height <= innerHeight - VIEWPORT_GAP;
    const top = fitsBelow ? below : Math.max(VIEWPORT_GAP, target.rect.top - height - VIEWPORT_GAP);
    const left = Math.max(
      VIEWPORT_GAP,
      Math.min(target.rect.left, innerWidth - width - VIEWPORT_GAP),
    );

    if (reopening) {
      element.style.height = `${fromHeight}px`;
      void element.offsetHeight;
    }
    element.style.height = `${height}px`;
    element.style.translate = `${left}px ${top}px`;
    element.style.transformOrigin = `${target.rect.left - left + 16}px ${fitsBelow ? "0" : "100%"}`;
    element.style.setProperty("--link-preview-rise", fitsBelow ? "-8px" : "8px");
    // Commit the hidden state first so the fade has somewhere to start from.
    void element.offsetHeight;
    element.style.removeProperty("transition");
    element.dataset.open = "true";
  }, [open, target, previews]);

  if (!target || !previews) return null;

  return (
    <div
      ref={card}
      popover="manual"
      aria-hidden="true"
      className="link-preview pointer-events-none fixed m-0 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-md border border-site-border bg-site-card p-0 font-mono text-sm text-site-foreground shadow-xl"
    >
      <div key={target.url} className={leaving ? "link-preview-enter" : undefined}>
        <PreviewContent target={target} preview={previews[target.url]} />
      </div>
      {leaving && (
        <div
          key={leaving.url}
          onAnimationEnd={clearLeaving}
          className="link-preview-leave absolute inset-x-0 top-0"
        >
          <PreviewContent target={leaving} preview={previews[leaving.url]} />
        </div>
      )}
    </div>
  );
}
