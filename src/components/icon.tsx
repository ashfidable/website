import icons from "virtual:site-icons";

type IconData = { body: string; width: number; height: number; left?: number; top?: number };

export function Icon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const icon = (icons as Record<string, IconData>)[name];
  if (!icon) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${icon.left ?? 0} ${icon.top ?? 0} ${icon.width} ${icon.height}`}
      width="1em"
      height="1em"
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
