export type Heading = { depth: number; slug: string; text: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>|[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}

export function extractHeadings(source: string): Heading[] {
  return source.split(/\r?\n/).flatMap((line) => {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!match) return [];
    const text = match[2].replace(/\[([^\]]+)]\([^)]*\)/g, "$1").replace(/[*_`]/g, "");
    return [{ depth: match[1].length, slug: slugify(text), text }];
  });
}
