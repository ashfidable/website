import spriteSheet from "$assets/images/ashfid_pixel_sheet.png";

export function Sprite({
  pixelScale = 3.5,
  playing = false,
}: {
  pixelScale?: number | string;
  playing?: boolean;
}) {
  return (
    <div
      className="character group mx-auto rounded-md"
      style={{ "--pixel-size": String(pixelScale) } as React.CSSProperties}
    >
      <img
        src={spriteSheet}
        width={960}
        height={48}
        alt="Ashfid"
        className={`spritesheet group-hover:animate-[moveSpritesheet_1.5s_steps(var(--frames))_infinite] ${playing ? "animate-[moveSpritesheet_1.5s_steps(var(--frames))_infinite]" : ""}`}
        loading="eager"
      />
    </div>
  );
}
