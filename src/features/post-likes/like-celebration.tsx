import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { usePostLikes } from "./use-post-likes";

const celebrationLength = 4500;
const rainLength = 1400;
const clearStart = 3700;
const scrambleLength = 260;
const beats = [1500, 1800, 2700, 3000];
const beatLength = 700;
const glyphs = "01<>/\\{}[]#$%&*+=~";
const heartColors = ["#e11d48", "#be123c", "#9f1239"];

function pick<T>(items: ArrayLike<T>) {
  return items[Math.floor(Math.random() * items.length)];
}

/** Glyphs rain down the terminal and lock into a giant heart, which then beats. */
function PixelHeart({ max }: { max: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const { width, height } = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const styles = getComputedStyle(canvas);
    const background = styles.borderTopColor;
    const muted = styles.color;
    const size = Math.max(12, Math.round(Math.min(width, height) / 26));
    context.font = `bold ${Math.round(size * 0.8)}px ${styles.fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    const columns = Math.ceil(width / size);
    const rows = Math.ceil(height / size);
    const rowTime = (rainLength - 500 - scrambleLength) / rows;
    const columnDelays = Array.from({ length: columns }, () => Math.random() * 500);
    const scale = Math.min(width, height) / 2.4;
    const cells = Array.from({ length: columns * rows }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = column * size;
      const y = row * size;
      const heartX = (x + size / 2 - width / 2) / scale;
      const heartY = (height / 2 - y - size / 2) / scale + 0.1;
      const curve = heartX ** 2 + heartY ** 2 - 1;
      return {
        x,
        y,
        arrive: columnDelays[column] + row * rowTime,
        leave: clearStart + columnDelays[column] * 0.6 + (rows - row) * rowTime * 0.5,
        heart: curve ** 3 - heartX ** 2 * heartY ** 3 <= 0,
        highlight: Math.hypot(heartX + 0.55, heartY - 0.75) < 0.22,
        shade: pick(heartColors),
        distance: Math.hypot(x - width / 2, y - height / 2),
        twinkle: Math.random() * 50,
      };
    });
    const waveLength = Math.hypot(width, height) / 2 / beatLength;

    const draw = (elapsed: number) => {
      context.clearRect(0, 0, width, height);
      for (const cell of cells) {
        const age = elapsed - cell.arrive;
        if (age < 0 || elapsed > cell.leave) continue;
        const { x, y } = cell;
        const glyphX = x + size / 2;
        const glyphY = y + size / 2;
        context.fillStyle = background;
        context.fillRect(x, y, size, size);
        if (age < scrambleLength) {
          context.fillStyle = age < 70 ? "#ffffff" : cell.heart ? "#fb7185" : muted;
          context.fillText(pick(glyphs), glyphX, glyphY);
          continue;
        }
        const hit = beats.some((beat) => {
          const radius = (elapsed - beat) * waveLength;
          return radius > 0 && Math.abs(cell.distance - radius) < size * 1.5;
        });
        if (cell.heart) {
          context.fillStyle = hit ? "#fda4af" : cell.highlight ? "#fb7185" : cell.shade;
          context.fillRect(x, y, size - 1, size - 1);
          context.fillStyle = hit ? "#ffffff" : "#00000033";
          context.fillText("♥", glyphX, glyphY);
          continue;
        }
        const twinkle = max && Math.sin(elapsed / 180 + cell.twinkle) > 0.97;
        context.globalAlpha = hit || twinkle ? 1 : 0.3;
        context.fillStyle = hit || twinkle ? "#fb7185" : muted;
        context.fillText(hit ? "+" : twinkle ? "♥" : "·", glyphX, glyphY);
        context.globalAlpha = 1;
      }
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(rainLength);
      return;
    }
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      draw(now - started);
      if (now - started < celebrationLength) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [max]);
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="like-thump absolute inset-0 h-full w-full border-site-card text-site-muted"
    />
  );
}

function TypedLine({
  delay,
  className = "",
  children,
}: {
  delay: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={`like-type whitespace-nowrap ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </p>
  );
}

export function LikeCelebration({
  state,
  anchor,
}: {
  state: ReturnType<typeof usePostLikes>;
  anchor: RefObject<HTMLElement | null>;
}) {
  const [target, setTarget] = useState<Element | null>(null);
  const [panelBox, setPanelBox] = useState<CSSProperties>();
  const [visible, setVisible] = useState(false);
  const celebratedTaps = useRef(0);
  const {
    likes: { taps },
    confirmedTaps,
    lastTap,
    saving,
    limited,
    error,
  } = state;
  useEffect(() => {
    setTarget(anchor.current?.closest("[data-terminal-window]") ?? null);
  }, [anchor]);
  useEffect(() => {
    setVisible(false);
    if (
      !taps ||
      confirmedTaps !== taps ||
      confirmedTaps <= celebratedTaps.current ||
      saving ||
      limited ||
      error
    )
      return;
    let hideTimer: ReturnType<typeof setTimeout>;
    const timer = setTimeout(
      () => {
        const panel = anchor.current?.closest("[data-terminal-scroll]");
        if (!target || !panel) return;
        // Sit over the content only, leaving the terminal header and footer in view.
        const outer = target.getBoundingClientRect();
        const inner = panel.getBoundingClientRect();
        setPanelBox({
          left: inner.left - outer.left - target.clientLeft,
          top: inner.top - outer.top - target.clientTop,
          width: inner.width,
          height: inner.height,
        });
        celebratedTaps.current = confirmedTaps;
        setVisible(true);
        hideTimer = setTimeout(() => setVisible(false), celebrationLength);
      },
      taps === 5 ? 0 : Math.max(0, lastTap + 2000 - Date.now()),
    );
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [taps, confirmedTaps, lastTap, saving, limited, error, target, anchor]);
  useEffect(() => {
    if (!lastTap || !target) return;
    // Each tap hits harder than the last.
    navigator.vibrate?.(taps === 5 ? [20, 30, 40] : 8);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const shake = taps === 5 ? 5 : taps;
    target.animate(
      [
        { transform: "none" },
        { transform: `translate(${-shake}px, ${shake / 2}px)` },
        { transform: `translate(${shake}px, ${-shake / 2}px)` },
        { transform: "none" },
      ],
      { duration: 160 + taps * 20, easing: "ease-out" },
    );
  }, [lastTap]);
  useEffect(() => {
    if (!visible) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [visible]);

  if (!visible || !target) return null;
  const max = taps === 5;
  return createPortal(
    <div
      style={panelBox}
      className="pointer-events-none absolute z-50 overflow-hidden print:hidden"
    >
      <PixelHeart max={max} />
      <div aria-hidden="true" className="like-scanlines absolute inset-0" />
      <div
        role="status"
        className="like-thanks absolute left-1/2 top-1/2 max-w-[calc(100%-1rem)] -translate-x-1/2 -translate-y-1/2 rounded border border-site-border bg-site-card px-4 py-3 font-mono text-sm shadow-lg"
      >
        <TypedLine delay={1300} className="text-site-muted">
          $ sudo like --hearts {taps}
        </TypedLine>
        <TypedLine delay={1650} className="text-red-500">
          [{"♥".repeat(taps)}
          <span className="text-site-muted">{"·".repeat(5 - taps)}</span>] {taps}/5 sent
        </TypedLine>
        <TypedLine delay={2000} className="mt-1 font-bold text-site-heading sm:text-base">
          Thank you for liking!
        </TypedLine>
        <TypedLine delay={2350} className="text-site-muted">
          # {max ? "You made my day." : "Every bit means a lot."}
          <span aria-hidden="true" className="like-caret ml-1">
            █
          </span>
        </TypedLine>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss thank-you animation"
        className="pointer-events-auto absolute right-3 top-3 rounded border border-site-border bg-site-card px-3 py-2 text-site-muted hover:text-site-heading focus-visible:outline-2 focus-visible:outline-site-ring"
      >
        close ×
      </button>
    </div>,
    target,
  );
}
