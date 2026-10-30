import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { OptimizedImage } from "$content/post-images";
import { useSettings } from "@/providers/settings-provider";
import { playAudio } from "@/utils/play-audio";
import { Icon } from "./icon";
import { focusRing } from "./terminal/data";
import { linkClass } from "./terminal/ui";

type ImageGalleryProps = {
  images: OptimizedImage[];
  altPrefix: string;
  pageSize?: number;
  spoiler?: boolean;
};

type Point = { x: number; y: number };

const viewerButtonClass =
  "grid h-10 w-10 shrink-0 place-items-center rounded-md text-white/75 outline-none transition-[background-color,color,transform] duration-150 hover:bg-white/10 hover:text-white active:scale-95 focus-visible:ring-2 focus-visible:ring-white/80 disabled:pointer-events-none disabled:opacity-30";

function mediaType(format: string) {
  return `image/${format === "jpg" ? "jpeg" : format}`;
}

function ResponsiveImage({
  image,
  alt,
  sizes,
  className,
  loading,
  ...props
}: {
  image: OptimizedImage;
  alt: string;
  sizes: string;
  className: string;
  loading?: "eager" | "lazy";
} & Omit<React.ComponentPropsWithoutRef<"img">, "alt" | "className" | "height" | "src" | "width">) {
  return (
    <picture className="contents">
      {Object.entries(image.sources).map(([format, srcSet]) => (
        <source key={format} type={mediaType(format)} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        {...props}
        src={image.img.src}
        alt={alt}
        width={image.img.w}
        height={image.img.h}
        loading={loading}
        decoding="async"
        className={className}
      />
    </picture>
  );
}

export function ImageGallery({ images, altPrefix, pageSize, spoiler = false }: ImageGalleryProps) {
  const settings = useSettings();
  const [viewerStart, setViewerStart] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(pageSize ?? images.length);
  const opener = useRef<HTMLButtonElement | null>(null);
  const visibleImages = images.slice(0, visibleCount);
  const remainingCount = images.length - visibleImages.length;
  const nextCount = Math.min(pageSize ?? remainingCount, remainingCount);
  const spoilersHidden = spoiler && settings.hideSpoilers;

  if (images.length === 0) return null;

  return (
    <>
      <section
        aria-label={`${altPrefix} gallery`}
        className="my-6 overflow-hidden rounded-md border border-site-border bg-site-card text-xs"
      >
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-site-border px-3 py-1.5">
          <p className="tabular-nums text-site-muted" aria-live="polite">
            <span aria-hidden="true"># </span>
            {visibleImages.length} of {images.length} images
          </p>
          {spoiler && (
            <button
              type="button"
              className={`-mx-1 inline-flex items-center gap-1.5 px-1 py-1 ${linkClass}`}
              onClick={() => {
                settings.toggleSpoilers();
                playAudio("/audio/sound_toggle_on.mp3", settings.sound);
              }}
              aria-pressed={settings.hideSpoilers}
              title={settings.hideSpoilers ? "Show spoilers" : "Hide spoilers"}
            >
              <Icon
                name={settings.hideSpoilers ? "mdi:eye-outline" : "mdi:eye-off-outline"}
                className="text-sm"
              />
              {settings.hideSpoilers ? "show spoilers" : "hide spoilers"}
            </button>
          )}
        </header>

        <div className="grid grid-cols-2 gap-1 p-1 sm:grid-cols-3">
          {visibleImages.map((src, index) => {
            const alt = `${altPrefix} ${String(index + 1).padStart(2, "0")}`;
            return (
              <button
                key={src.img.src}
                type="button"
                className={`group relative aspect-video overflow-hidden rounded bg-site-page [content-visibility:auto] ${focusRing}`}
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setViewerStart(index);
                }}
                title={`Open ${alt}`}
              >
                <ResponsiveImage
                  image={src}
                  alt={alt}
                  loading="lazy"
                  sizes="(min-width: 640px) 15rem, 50vw"
                  className={`h-full w-full object-cover ${spoilersHidden ? "scale-110 blur-xl" : "transition-transform duration-300 ease-springy group-hover:scale-[1.025]"}`}
                />
                {spoilersHidden && (
                  <span className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span className="rounded bg-black/75 px-1.5 py-0.5 text-[0.65rem] text-white/85">
                      spoiler
                    </span>
                  </span>
                )}
                <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[0.65rem] tabular-nums text-white/85 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>

        {remainingCount > 0 && (
          <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-site-border px-3 py-1.5">
            <button
              type="button"
              className={`-mx-1 px-1 py-1 ${linkClass}`}
              onClick={() => setVisibleCount((count) => Math.min(count + nextCount, images.length))}
            >
              <span aria-hidden="true">› </span>load {nextCount} more
            </button>
            <button
              type="button"
              className={`-mx-1 px-1 py-1 ${linkClass}`}
              onClick={() => setVisibleCount(images.length)}
            >
              load all ({remainingCount} left)
            </button>
          </footer>
        )}
      </section>

      {viewerStart !== null && (
        <ImageViewer
          images={images}
          altPrefix={altPrefix}
          startIndex={viewerStart}
          opener={opener}
          onClose={() => setViewerStart(null)}
        />
      )}
    </>
  );
}

/** Owns zoom and drag state so per-pointer updates never re-render the thumbnail grid. */
function ImageViewer({
  images,
  altPrefix,
  startIndex,
  opener,
  onClose,
}: {
  images: OptimizedImage[];
  altPrefix: string;
  startIndex: number;
  opener: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ pointer: Point; offset: Point } | null>(null);
  const image = images[index];

  function resetView() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
    dragStart.current = null;
  }

  function showImage(direction: -1 | 1) {
    setIndex((current) => (current + direction + images.length) % images.length);
    resetView();
  }

  function changeZoom(amount: number) {
    const next = Math.min(3, Math.max(1, Number((zoom + amount).toFixed(2))));
    setZoom(next);
    if (next === 1) setOffset({ x: 0, y: 0 });
  }

  function startDrag(event: ReactPointerEvent<HTMLImageElement>) {
    if (zoom === 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointer: { x: event.clientX, y: event.clientY },
      offset,
    };
    setDragging(true);
  }

  function dragImage(event: ReactPointerEvent<HTMLImageElement>) {
    if (!dragStart.current) return;
    setOffset({
      x: dragStart.current.offset.x + event.clientX - dragStart.current.pointer.x,
      y: dragStart.current.offset.y + event.clientY - dragStart.current.pointer.y,
    });
  }

  function stopDrag(event: ReactPointerEvent<HTMLImageElement>) {
    if (!dragStart.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStart.current = null;
    setDragging(false);
  }

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[70] flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md border border-white/10 bg-neutral-950 text-white shadow-2xl outline-none sm:h-[min(92dvh,56rem)] sm:w-[min(94vw,90rem)]"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") showImage(-1);
            else if (event.key === "ArrowRight") showImage(1);
            else if (event.key === "+" || event.key === "=") changeZoom(0.25);
            else if (event.key === "-") changeZoom(-0.25);
            else if (event.key === "0") resetView();
            else return;
            event.preventDefault();
          }}
        >
          <Dialog.Title className="sr-only">{`${altPrefix} ${index + 1}`}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Use the arrow keys to move between images. Use plus and minus to zoom.
          </Dialog.Description>

          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-2 sm:px-3">
            <div
              className="min-w-20 font-mono text-xs tabular-nums text-white/60"
              aria-live="polite"
            >
              {index + 1} / {images.length}
            </div>
            <div role="group" className="flex items-center gap-1" aria-label="Zoom controls">
              <button
                type="button"
                className={viewerButtonClass}
                onClick={() => changeZoom(-0.25)}
                disabled={zoom === 1}
                aria-label="Zoom out"
              >
                <Icon name="mdi:magnify-minus-outline" className="text-xl" />
              </button>
              <button
                type="button"
                className="min-w-14 rounded-md px-2 py-2 font-mono text-xs tabular-nums text-white/65 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/80"
                onClick={resetView}
                aria-label={`${Math.round(zoom * 100)}%: reset zoom`}
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                className={viewerButtonClass}
                onClick={() => changeZoom(0.25)}
                disabled={zoom === 3}
                aria-label="Zoom in"
              >
                <Icon name="mdi:magnify-plus-outline" className="text-xl" />
              </button>
            </div>
            <Dialog.Close className={viewerButtonClass} aria-label="Close image gallery">
              <Icon name="mdi:close" className="text-xl" />
            </Dialog.Close>
          </header>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-neutral-950">
            <button
              type="button"
              className={`${viewerButtonClass} absolute left-2 z-10 bg-black/40 backdrop-blur-sm sm:left-3`}
              onClick={() => showImage(-1)}
              aria-label="Previous image"
            >
              <Icon name="mdi:chevron-left" className="text-2xl" />
            </button>

            <ResponsiveImage
              key={image.img.src}
              image={image}
              alt={`${altPrefix} ${index + 1}`}
              sizes="100vw"
              draggable={false}
              className={`max-h-[calc(100dvh-5.5rem)] max-w-full touch-none select-none object-contain ${dragging ? "cursor-grabbing" : `transition-transform duration-150 ${zoom > 1 ? "cursor-grab" : "cursor-zoom-in"}`}`}
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
              }}
              onClick={() => {
                if (zoom === 1) changeZoom(0.5);
              }}
              onDoubleClick={resetView}
              onPointerDown={startDrag}
              onPointerMove={dragImage}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
            />

            <button
              type="button"
              className={`${viewerButtonClass} absolute right-2 z-10 bg-black/40 backdrop-blur-sm sm:right-3`}
              onClick={() => showImage(1)}
              aria-label="Next image"
            >
              <Icon name="mdi:chevron-right" className="text-2xl" />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
