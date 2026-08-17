import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { OptimizedImage } from "$content/post-images";
import { useSettings } from "@/providers/settings-provider";
import { playAudio } from "@/utils/play-audio";
import { Icon } from "./icon";

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(pageSize ?? images.length);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const dragStart = useRef<{ pointer: Point; offset: Point } | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const visibleImages = images.slice(0, visibleCount);
  const remainingCount = images.length - visibleImages.length;
  const nextCount = Math.min(pageSize ?? remainingCount, remainingCount);
  const spoilersHidden = spoiler && settings.hideSpoilers;

  function resetView() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
    dragStart.current = null;
  }

  function openImage(index: number, button: HTMLButtonElement) {
    opener.current = button;
    setActiveIndex(index);
    resetView();
  }

  function closeViewer() {
    setActiveIndex(null);
    resetView();
  }

  function showImage(direction: -1 | 1) {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + direction + images.length) % images.length;
    });
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

  if (images.length === 0) return null;

  return (
    <Dialog.Root
      open={activeIndex !== null}
      onOpenChange={(open) => {
        if (!open) closeViewer();
      }}
    >
      <div className="group/gallery relative my-6">
        {spoiler && (
          <button
            type="button"
            className="absolute right-2 top-2 z-20 flex items-center gap-1.5 rounded-md border border-white/15 bg-black/70 px-2.5 py-2 text-xs font-semibold text-white/90 shadow-lg backdrop-blur-md outline-none transition-[background-color,opacity,transform] hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-white/80 sm:translate-y-1 sm:opacity-0 sm:group-hover/gallery:translate-y-0 sm:group-hover/gallery:opacity-100 sm:focus-within:translate-y-0 sm:focus-within:opacity-100"
            onClick={() => {
              settings.toggleSpoilers();
              playAudio("/audio/sound_toggle_on.mp3", settings.sound);
            }}
            aria-label="Spoiler protection"
            aria-pressed={settings.hideSpoilers}
            title={settings.hideSpoilers ? "Show spoilers" : "Hide spoilers"}
          >
            <Icon
              name={settings.hideSpoilers ? "mdi:eye-outline" : "mdi:eye-off-outline"}
              className="text-base"
            />
            {settings.hideSpoilers ? "Show spoilers" : "Hide spoilers"}
          </button>
        )}

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {visibleImages.map((src, index) => {
            const alt = `${altPrefix} ${String(index + 1).padStart(2, "0")}`;
            return (
              <button
                key={src.img.src}
                type="button"
                className="group relative aspect-[16/10] overflow-hidden rounded-md bg-site-card outline-none focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-2 focus-visible:ring-offset-site-page"
                onClick={(event) => openImage(index, event.currentTarget)}
                aria-label={`Open ${alt}`}
              >
                <ResponsiveImage
                  image={src}
                  alt={alt}
                  loading="lazy"
                  sizes="(min-width: 1024px) 15rem, (min-width: 640px) 30vw, 50vw"
                  className={`h-full w-full object-cover transition-[filter,transform] duration-300 ease-springy ${spoilersHidden ? "scale-110 blur-xl group-hover:scale-[1.125]" : "group-hover:scale-[1.025]"}`}
                />
                {spoilersHidden && (
                  <span className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span className="rounded-md bg-black/65 px-2 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                      Spoiler hidden
                    </span>
                  </span>
                )}
                <span className="absolute bottom-1.5 right-1.5 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[0.65rem] tabular-nums text-white/85 opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
          {remainingCount > 0 && (
            <div className="flex aspect-[16/10] flex-col overflow-hidden rounded-md border border-site-border bg-site-card">
              <button
                type="button"
                className="group flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-3 text-site-foreground outline-none transition-colors hover:bg-site-card-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-site-ring"
                onClick={() =>
                  setVisibleCount((count) => Math.min(count + nextCount, images.length))
                }
              >
                <Icon
                  name="mdi:image-multiple-outline"
                  className="text-xl text-site-icon-hover transition-transform duration-150 group-hover:scale-110"
                />
                <span className="text-sm font-semibold">Load {nextCount} more</span>
                <span className="text-xs tabular-nums text-site-muted" aria-live="polite">
                  {remainingCount} remaining
                </span>
              </button>
              <button
                type="button"
                className="border-t border-site-border px-3 py-2 text-xs font-medium text-site-muted outline-none transition-[background-color,color] hover:bg-site-card-hover hover:text-site-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-site-ring"
                onClick={() => setVisibleCount(images.length)}
              >
                Load All
              </button>
            </div>
          )}
        </div>
      </div>

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
          <Dialog.Title className="sr-only">
            {activeIndex === null ? "Image gallery" : `${altPrefix} ${activeIndex + 1}`}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Use the arrow keys to move between images. Use plus and minus to zoom.
          </Dialog.Description>

          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-2 sm:px-3">
            <div
              className="min-w-20 font-mono text-xs tabular-nums text-white/60"
              aria-live="polite"
            >
              {activeIndex === null ? 0 : activeIndex + 1} / {images.length}
            </div>
            <div className="flex items-center gap-1" aria-label="Zoom controls">
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
                aria-label="Reset zoom"
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

            {activeImage && (
              <ResponsiveImage
                key={activeImage.img.src}
                image={activeImage}
                alt={`${altPrefix} ${activeIndex! + 1}`}
                sizes="100vw"
                draggable={false}
                className={`max-h-[calc(100dvh-5.5rem)] max-w-full touch-none select-none object-contain transition-transform duration-150 ${zoom > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"}`}
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
            )}

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
