import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { addPostLikes, getPostLikes } from "./post-likes";

const maxLikes = 5;
const batchDelay = 500;

export function usePostLikes(postKey: string) {
  const queryClient = useQueryClient();
  const queryKey = ["post-likes", postKey] as const;
  const [taps, setTaps] = useState(0);
  const [confirmedTaps, setConfirmedTaps] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [limited, setLimited] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const tapsRef = useRef(0);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const queued = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const limitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { data: total, isPending: pending } = useQuery({
    queryKey,
    queryFn: () => getPostLikes({ data: { postKey } }),
    staleTime: 60_000,
  });
  function rollBack(amount: number) {
    tapsRef.current = Math.max(0, tapsRef.current - amount);
    setTaps(tapsRef.current);
    queryClient.setQueryData<number>(queryKey, (current = amount) => Math.max(0, current - amount));
  }
  const { mutate } = useMutation({
    mutationFn: (amount: number) => addPostLikes({ data: { postKey, amount } }),
    onSuccess: (total, amount) => {
      if (total === null) {
        rollBack(amount + queued.current);
        queued.current = 0;
        setLimited(true);
        if (mounted.current) {
          clearTimeout(limitTimer.current);
          limitTimer.current = setTimeout(() => setLimited(false), 60_000);
        }
        return;
      }
      setConfirmedTaps((current) => current + amount);
      // Include taps made while this request was saving.
      queryClient.setQueryData(queryKey, total + queued.current);
    },
    onError: (_error, amount) => {
      rollBack(amount + queued.current);
      queued.current = 0;
      setError(true);
    },
    onSettled: () => {
      inFlight.current = false;
      if (queued.current > 0) flush();
      else setSaving(false);
    },
  });
  function flush() {
    if (queued.current === 0 || inFlight.current) return;
    const amount = queued.current;
    queued.current = 0;
    clearTimeout(timer.current);
    inFlight.current = true;
    setSaving(true);
    mutate(amount);
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
      clearTimeout(limitTimer.current);
      // Don't lose a queued like when the reader leaves the article.
      flush();
    };
  }, []);

  function sendLike() {
    if (pending || limited || tapsRef.current >= maxLikes) return;
    tapsRef.current += 1;
    setTaps(tapsRef.current);
    setLastTap(Date.now());
    setError(false);
    queryClient.setQueryData<number>(queryKey, (current = 0) => current + 1);
    queued.current += 1;
    clearTimeout(timer.current);
    if (tapsRef.current === maxLikes) flush();
    else timer.current = setTimeout(flush, batchDelay);
  }

  return {
    likes: { taps, total: total ?? 0 },
    sendLike,
    done: taps === maxLikes,
    pending,
    saving,
    limited,
    error,
    confirmedTaps,
    lastTap,
  };
}
