export type OptimizedImage = {
  sources: Record<string, string>;
  img: {
    src: string;
    w: number;
    h: number;
  };
};

const finalFantasyAvifModules = import.meta.glob<string>(
  "/src/assets/images/posts/final-fantasy-7-remake/*.jpg",
  {
    eager: true,
    import: "default",
    query:
      "?w=480;960;1920&format=avif&quality=50&withoutEnlargement&as=srcset",
  },
);

const finalFantasyWebpModules = import.meta.glob<OptimizedImage>(
  "/src/assets/images/posts/final-fantasy-7-remake/*.jpg",
  {
    eager: true,
    import: "default",
    query:
      "?w=480;960;1920&format=webp&quality=72&withoutEnlargement&as=picture",
  },
);

export const finalFantasy7RemakeScreenshots = Object.entries(finalFantasyWebpModules)
  .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
  .map(([path, image]) => {
    const avifSrcSet = finalFantasyAvifModules[path];
    if (!avifSrcSet) throw new Error(`Missing optimized AVIF source for ${path}`);

    return {
      ...image,
      sources: { avif: avifSrcSet, ...image.sources },
    };
  });
