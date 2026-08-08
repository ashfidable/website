export function playAudio(url: string, enabled = true) {
  if (!enabled) return;
  const audio = new Audio(url);
  audio.volume = 0.2;
  void audio.play().catch(() => {});
}
