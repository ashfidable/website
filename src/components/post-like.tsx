import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { Icon } from "./icon";

const maxLikes = 5;
const batchDelay = 500;
const emptyLikes = { taps: 0, total: 0 };
const limitMessage = "Try again in 1 minute.";
const heartPath =
  "M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08A5.96 5.96 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z";

export function PostLikeSummary({ state }: { state: ReturnType<typeof usePostLikes> }) {
  const { likes, sendLike, done, pending, saving, limited } = state;
  const busy = pending || saving;

  return (
    <button
      type="button"
      disabled={busy || limited || done}
      onClick={sendLike}
      aria-busy={busy}
      className="group flex items-center gap-2 rounded-md border border-site-border bg-site-card px-2 py-1 transition-colors hover:border-site-border-hover hover:bg-site-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-ring disabled:cursor-default"
      aria-label={
        pending
          ? "Loading likes"
          : limited
            ? `${limitMessage} ${likes.total} total likes`
            : done
              ? `Five likes sent. ${likes.total} total likes`
              : `Like this post. ${likes.total} total likes`
      }
      title={limited ? limitMessage : "Like this post"}
    >
      <Icon
        key={`summary-heart-${likes.taps}`}
        name="mdi:heart"
        className={`text-lg text-red-500 group-hover:text-red-400 ${busy ? "animate-pulse" : likes.taps > 0 ? "like-heart-hit" : ""}`}
      />
      <strong className="font-mono tabular-nums" aria-live="polite">
        {pending ? "…" : likes.total}
      </strong>
      {limited && (
        <span className="text-effect font-mono text-sm font-black">Try again in 1 minute</span>
      )}
    </button>
  );
}

export function PostLike({ state }: { state: ReturnType<typeof usePostLikes> }) {
  const { likes, sendLike, done, pending, saving, limited } = state;
  const busy = pending || saving;

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <div className="sticky top-[calc(100dvh-12.5rem)] ml-auto h-0 w-0 md:top-[calc(100dvh-7.5rem)]">
        <button
          type="button"
          disabled={busy || limited || done}
          onClick={sendLike}
          aria-busy={busy}
          className={`group pointer-events-auto absolute right-3 top-0 grid size-14 place-items-center rounded-full outline-none transition-transform duration-150 ease-springy hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-4 focus-visible:ring-offset-site-page disabled:cursor-default disabled:hover:scale-100 md:-right-11 ${busy ? "animate-pulse" : ""}`}
          aria-label={
            pending
              ? "Loading likes"
              : limited
                ? `${limitMessage} ${likes.total} total likes`
                : done
                  ? `Five likes sent. ${likes.total} total likes`
                  : `Send like ${likes.taps + 1} of ${maxLikes}. ${likes.total} total likes`
          }
          title={pending ? "Loading likes" : limited ? limitMessage : `${likes.total} total likes`}
        >
          {done && <Shine />}
          {likes.taps > 0 && (
            <span
              key={`score-${likes.taps}`}
              className={`like-score ${done ? "text-amber-300" : "text-red-400"}`}
              aria-hidden="true"
            >
              +{likes.taps}
            </span>
          )}
          {limited && (
            <span
              className="text-effect pointer-events-none absolute top-1/2 right-[calc(100%+0.75rem)] -translate-y-1/2 whitespace-nowrap font-mono text-sm font-black drop-shadow-[0_2px_2px_rgb(0_0_0/0.85)]"
              aria-hidden="true"
            >
              Try again in 1 minute
            </span>
          )}
          <HeartFill likes={likes.taps} />
          <span className="like-total text-effect" aria-hidden="true">
            <strong className="like-total-value">{pending ? "…" : likes.total}</strong>
          </span>
          <span className="sr-only" aria-live="polite">
            {pending
              ? "Loading likes"
              : limited
                ? limitMessage
                : `${likes.taps} of ${maxLikes} likes sent. ${likes.total} total likes`}
          </span>
        </button>
      </div>
    </div>
  );
}

export function usePostLikes(postKey: string) {
  const queryClient = useQueryClient();
  const queryKey = ["post-likes", postKey] as const;
  const [category, slug] = postKey.split(":");
  const path = `/api/likes/${category}/${slug}`;
  const [taps, setTaps] = useState(0);
  const [limited, setLimited] = useState(false);
  const queued = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const limitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { data: total, isPending: pending } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Could not load post likes (${response.status})`);

      const total: unknown = await response.json();
      if (typeof total !== "number") throw new Error("Invalid post like count");

      return total;
    },
    staleTime: 60_000,
  });
  function rollBack(amount: number) {
    setTaps((current) => Math.max(0, current - amount));
    queryClient.setQueryData<number>(queryKey, (current = amount) => Math.max(0, current - amount));
  }
  const { mutate, isPending: saving } = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (response.status === 429) {
        return {
          retryAfter: Number(response.headers.get("Retry-After")) || 60,
        };
      }
      if (!response.ok) throw new Error(`Could not save post likes (${response.status})`);

      const total: unknown = await response.json();
      if (typeof total !== "number") throw new Error("Invalid post like count");

      return { total };
    },
    onSuccess: async (result, amount) => {
      if (result.retryAfter !== undefined) {
        rollBack(amount);
        setLimited(true);
        if (limitTimer.current) clearTimeout(limitTimer.current);
        limitTimer.current = setTimeout(() => setLimited(false), result.retryAfter * 1000);
        await queryClient.invalidateQueries({ queryKey });
        return;
      }

      queryClient.setQueryData(queryKey, result.total);
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (_error, amount) => rollBack(amount),
  });
  function flush() {
    if (queued.current === 0) return;
    const amount = queued.current;
    queued.current = 0;
    if (timer.current) clearTimeout(timer.current);
    mutate(amount);
  }
  function sendLike() {
    if (pending || saving || limited || taps === maxLikes) return;

    const nextTaps = taps + 1;
    setTaps(nextTaps);
    queryClient.setQueryData<number>(queryKey, (current = 0) => current + 1);
    queued.current += 1;

    if (timer.current) clearTimeout(timer.current);
    if (nextTaps === maxLikes) flush();
    else timer.current = setTimeout(flush, batchDelay);
  }
  const likes = total === undefined ? emptyLikes : { taps, total };
  const done = taps === maxLikes;

  return { likes, sendLike, done, pending, saving, limited };
}

function HeartFill({ likes }: { likes: number }) {
  const clipId = useId();
  const baseGradientId = useId();
  const fillGradientId = useId();
  const fill = likes / maxLikes;

  return (
    <svg viewBox="0 0 24 24" className="size-12 overflow-visible" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect
            x="0"
            y="0"
            width="24"
            height="24"
            className="like-fill-mask"
            style={{ transform: `scaleY(${fill})` }}
          />
        </clipPath>
        <linearGradient
          id={baseGradientId}
          x1="3"
          y1="2"
          x2="21"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-gradient-from)" stopOpacity="0.32" />
          <stop offset="1" stopColor="var(--color-gradient-to)" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id={fillGradientId}
          x1="3"
          y1="2"
          x2="21"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-gradient-from)" />
          <stop offset="1" stopColor="var(--color-gradient-to)" />
        </linearGradient>
      </defs>
      <path d={heartPath} fill={`url(#${baseGradientId})`} />
      <path
        d={heartPath}
        fill="none"
        stroke={`url(#${fillGradientId})`}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d={heartPath} clipPath={`url(#${clipId})`} fill={`url(#${fillGradientId})`} />
    </svg>
  );
}

function Shine() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="like-shine pointer-events-none absolute -inset-3 size-20 text-amber-300"
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="27" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M40 2v12M40 66v12M2 40h12M66 40h12M13 13l9 9M58 58l9 9M67 13l-9 9M22 58l-9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
