/* Reel Card */
import { Play } from "lucide-react";

import { useKeyLight } from "@/hooks/useKeyLight";
import { cn } from "@/utils/cn";

const CATEGORY_LABELS = {
  monologue: "Monologue",
  highlight: "Scene Cut",
  bts: "Behind The Scenes",
  audition: "Audition Lab",
  teaser: "Teaser",
};

/**
 * 9:16 vertical reel card under a key light.
 * Displays short-form cinema clips, monologues, and behind-the-scenes moments.
 * Clicking opens the immersive vertical reel player modal.
 */
export default function ReelCard({ reel, onOpen, className }) {
  const light = useKeyLight();

  const formatViews = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return n;
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("group relative flex flex-col", className)}>
      <button
        type="button"
        onClick={() => onOpen?.(reel)}
        onPointerLeave={light.onPointerLeave}
        onPointerMove={light.onPointerMove}
        aria-haspopup="dialog"
        aria-label={`Play reel: ${reel.title}`}
        data-glass=""
        className="keylight ember relative block aspect-9/16 w-full cursor-pointer overflow-hidden rounded-2xl bg-surface-card text-left shadow-[0_12px_32px_rgb(0_0_0/0.5)] transition-transform duration-300 outline-offset-4 focus-visible:ring-2 focus-visible:ring-brand"
      >
        {/* Poster Image */}
        <img
          src={reel.poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/90 opacity-90 transition-opacity group-hover:opacity-100" />

        {/* Top Badges: Category & Duration */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className="molten-glass rounded-full px-2.5 py-1 text-caption font-semibold tracking-wide text-text-primary backdrop-blur-md">
            {CATEGORY_LABELS[reel.category] ?? reel.category}
          </span>
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-caption font-medium text-text-secondary backdrop-blur-xs">
            {formatDuration(reel.duration)}
          </span>
        </div>

        {/* Center Hover Play Pulse */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span className="molten-glass grid h-14 w-14 place-items-center rounded-full text-brand shadow-[0_0_24px_color-mix(in_oklab,var(--color-brand)_50%,transparent)] transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 h-6 w-6 fill-current" aria-hidden="true" />
          </span>
        </div>

        {/* Bottom Content: Title, Talent & Views */}
        <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1.5">
          {reel.talent && (
            <div className="flex items-center gap-2">
              {reel.talent.avatar ? (
                <img
                  src={reel.talent.avatar}
                  alt=""
                  className="h-5 w-5 rounded-full border border-white/20 object-cover"
                />
              ) : null}
              <span className="line-clamp-1 text-caption font-medium text-text-muted">
                {reel.talent.name}
              </span>
            </div>
          )}

          <h3 className="line-clamp-2 text-small font-semibold text-text-primary drop-shadow-sm group-hover:text-brand-200">
            {reel.title}
          </h3>

          <div className="flex items-center justify-between pt-0.5 text-caption text-text-muted">
            <span>{formatViews(reel.views)} views</span>
            {reel.titleName && (
              <span className="line-clamp-1 max-w-[60%] text-right text-brand">
                {reel.titleName}
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
