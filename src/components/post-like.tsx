import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { Icon } from "./icon";

const maxLikes = 5;
const emptyLikes = { taps: 0, total: 0 };
const heartPath =
  "M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08A5.96 5.96 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z";

export function PostLikeSummary({ postKey }: { postKey: string }) {
  const { likes, sendLike, done } = usePostLikes(postKey);

  return (
    <button
      type="button"
      disabled={done}
      onClick={sendLike}
      className="group flex items-center gap-2 rounded-md border border-site-border bg-site-card px-2 py-1 transition-colors hover:border-site-border-hover hover:bg-site-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-ring disabled:cursor-default"
      aria-label={
        done
          ? `Five likes sent. ${likes.total} total likes`
          : `Like this post. ${likes.total} total likes`
      }
      title="Like this post"
    >
      <Icon
        key={`summary-heart-${likes.taps}`}
        name="mdi:heart"
        className={`text-lg text-red-500 group-hover:text-red-400 ${likes.taps > 0 ? "like-heart-hit" : ""}`}
      />
      <strong className="font-mono tabular-nums" aria-live="polite">
        {likes.total}
      </strong>
    </button>
  );
}

export function PostLike({ postKey }: { postKey: string }) {
  const { likes, sendLike, done } = usePostLikes(postKey);

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <div className="sticky top-[calc(100dvh-12.5rem)] ml-auto h-0 w-0 md:top-[calc(100dvh-7.5rem)]">
        <button
          type="button"
          disabled={done}
          onClick={sendLike}
          className="group pointer-events-auto absolute right-3 top-0 grid size-14 place-items-center rounded-full outline-none transition-transform duration-150 ease-springy hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-4 focus-visible:ring-offset-site-page disabled:cursor-default disabled:hover:scale-100 md:-right-11"
          aria-label={
            done
              ? `Five likes sent. ${likes.total} total likes`
              : `Send like ${likes.taps + 1} of ${maxLikes}. ${likes.total} total likes`
          }
          title={`${likes.total} total likes`}
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
          <HeartFill key={`heart-${likes.taps}`} likes={likes.taps} />
          <span className="like-total text-effect" aria-hidden="true">
            <strong className="like-total-value">{likes.total}</strong>
          </span>
          <span className="sr-only" aria-live="polite">
            {likes.taps} of {maxLikes} likes sent. {likes.total} total likes
          </span>
        </button>
      </div>
    </div>
  );
}

function usePostLikes(postKey: string) {
  const queryClient = useQueryClient();
  const queryKey = ["post-likes", postKey] as const;
  const { data: likes = emptyLikes } = useQuery({
    queryKey,
    queryFn: () => Promise.resolve(emptyLikes),
    initialData: emptyLikes,
    staleTime: Infinity,
  });
  const likeMutation = useMutation({
    mutationFn: () => Promise.resolve(),
    onMutate: () => {
      queryClient.setQueryData<typeof emptyLikes>(queryKey, (count = emptyLikes) => {
        if (count.taps === maxLikes) return count;
        return { taps: count.taps + 1, total: count.total + 1 };
      });
    },
  });
  const done = likes.taps === maxLikes;

  return { likes, sendLike: () => likeMutation.mutate(), done };
}

function HeartFill({ likes }: { likes: number }) {
  const clipId = useId();
  const fill = (likes / maxLikes) * 24;

  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-12 overflow-visible ${likes > 0 ? "like-heart-hit" : ""}`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y={24 - fill} width="24" height={fill} />
        </clipPath>
      </defs>
      <path d={heartPath} className="fill-site-button" />
      <path
        d={heartPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        className="text-site-muted transition-colors group-hover:text-red-400"
      />
      <path d={heartPath} clipPath={`url(#${clipId})`} className="fill-red-500" />
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
