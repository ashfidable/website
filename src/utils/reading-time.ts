export function getReadingTime(text: string) {
  if (!text) return undefined;
  const withoutFrontmatter = text.replace(/^---[\s\S]*?---/, "");
  const words = withoutFrontmatter
    .replace(/<[^>]+>|[`#*_>[\]()-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (!words) return undefined;
  const minutes = Math.ceil(words / 150);
  return `${minutes} ${minutes > 1 ? "mins" : "min"} read`;
}
