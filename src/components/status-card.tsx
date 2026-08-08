import { useEffect, useState } from "react";
import { useLanyard } from "use-lanyard";
import { Icon } from "./icon";
import { site } from "$content/index";

export function StatusCard() {
  const data = useLanyard(site.discordId as `${bigint}`);
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => tick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activity = data?.activities?.[0];
  const spotify = data?.spotify;
  const elapsed = spotify ? Math.max(0, Date.now() - spotify.timestamps.start) : 0;
  const duration = spotify ? spotify.timestamps.end - spotify.timestamps.start : 1;
  const progress = Math.min(100, (elapsed / duration) * 100);
  const minutes = Math.floor(elapsed / 60000);
  const seconds = String(Math.floor((elapsed / 1000) % 60)).padStart(2, "0");
  const statusColor =
    data?.discord_status === "online"
      ? "bg-green-500"
      : data?.discord_status === "idle"
        ? "bg-yellow-500"
        : "bg-red-500";
  const title = spotify ? "Listening to Spotify" : activity ? "Playing" : "Thinking...";

  return (
    <section className="overflow-hidden p-1">
      <header className="flex items-center gap-2 text-sm md:mb-1 md:border-b md:border-site-border md:pb-1">
        {spotify && <Icon name="mdi:spotify" className="text-green-500" />}
        {!spotify && activity && (
          <Icon name="mdi:gamepad-variant" className="text-site-icon-hover" />
        )}
        {!activity && !spotify && (
          <span className={`h-2 w-2 animate-bounce rounded-full ${statusColor}`} />
        )}
        <span className="font-mono">{title}</span>
      </header>
      {spotify && (
        <section className="flex items-center gap-2 pb-2 text-sm md:block md:px-1 md:p-2">
          <a
            href={`spotify:track:${spotify.track_id}`}
            className="flex items-center gap-2 md:block"
          >
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap font-bold">
              {spotify.song}
            </span>
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
              by <span className="font-bold">{spotify.artist}</span>
            </span>
          </a>
          <div className="mt-2 hidden h-2 overflow-hidden rounded-md bg-site-spotify-track md:block">
            <div
              className="h-full bg-site-spotify-progress transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <time className="hidden md:block">
            {minutes}:{seconds}
          </time>
        </section>
      )}
      {!spotify && activity && (
        <section>
          <span className="font-semibold text-site-heading">{activity.name}</span>
          {activity.state && (
            <div>
              <span>Currently: </span>
              <span className="font-semibold">{activity.state}</span>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
