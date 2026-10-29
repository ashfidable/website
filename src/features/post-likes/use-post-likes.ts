import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { addPostLikes, getPostLikes } from "./post-likes";

const maxLikes = 5;
const batchDelay = 500;
const emptyLikes = { taps: 0, total: 0 };

export function usePostLikes(postKey: string) {
  const queryClient = useQueryClient();
  const queryKey = ["post-likes", postKey] as const;
  const [taps, setTaps] = useState(0);
  const [limited, setLimited] = useState(false);
  const queued = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const limitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { data: total, isPending: pending } = useQuery({
    queryKey,
    queryFn: () => getPostLikes({ data: { postKey } }),
    staleTime: 60_000,
  });
  function rollBack(amount: number) {
    setTaps((current) => Math.max(0, current - amount));
    queryClient.setQueryData<number>(queryKey, (current = amount) => Math.max(0, current - amount));
  }
  const { mutate, isPending: saving } = useMutation({
    mutationFn: (amount: number) => addPostLikes({ data: { postKey, amount } }),
    onSuccess: async (total, amount) => {
      if (total === null) {
        rollBack(amount);
        setLimited(true);
        if (limitTimer.current) clearTimeout(limitTimer.current);
        limitTimer.current = setTimeout(() => setLimited(false), 60_000);
        await queryClient.invalidateQueries({ queryKey });
        return;
      }

      queryClient.setQueryData(queryKey, total);
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
