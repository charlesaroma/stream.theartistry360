/* Reel Card */
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

import { useHls } from "@/hooks/useHls";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/format";
import { canPreview, categoryOf, formatCount } from "@/utils/reels";

const HOVER_INTENT = 350; // ms; sweeping across the grid starts nothing

/**
 * A 9:16 reel. Details sit on a dark fade at the bottom (title, creator,
 * views and length); the category is a coloured dot, and a watched reel
 * carries an orange line along the bottom. Hovering with a mouse on a good
 * connection plays the scene silently; the stream loads only then.
 */
export default function ReelCard({ reel, onOpen, watched = false, className }) {
  const [previewing, setPreviewing] = useState(false);
  const intent = useRef(0);
  const category = categoryOf(reel.category);

  const enter = () => {
    if (!canPreview()) return;
    clearTimeout(intent.current);
    intent.current = setTimeout(() => setPreviewing(true), HOVER_INTENT);
  };
  const leave = () => {
    clearTimeout(intent.current);
    setPreviewing(false);
  };
  useEffect(() => () => clearTimeout(intent.current), []);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(reel)}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={leave}
      aria-haspopup="dialog"
      aria-label={`Play reel: ${reel.title}${watched ? " (watched)" : ""}`}
      className={cn(
        "group relative block aspect-9/16 w-full cursor-pointer overflow-hidden rounded-xl bg-surface-card text-left shadow-[0_10px_28px_rgb(0_0_0/0.45)] outline-offset-4 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand",
        className,
      )}
    >
      <img src={reel.poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      {previewing && <CardPreview reel={reel} />}

      {/* Category dot */}
      {category && (
        <span className="absolute left-3 top-3 flex items-center" title={category.one}>
          <span className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-black/40", category.dot)} aria-hidden="true" />
          <span className="sr-only">{category.one}</span>
        </span>
      )}

      {/* Play in an orbit, on hover and focus */}
      <span className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
        <OrbitPlay />
      </span>

      {/* Details on a dark fade */}
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-t from-black/95 via-black/70 to-transparent p-3 pt-12">
        <span className="line-clamp-2 text-small font-semibold leading-snug text-text-primary">{reel.title}</span>
        {reel.talent && (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-caption text-text-secondary">{reel.talent.name}</span>
          </span>
        )}
        <span className="text-caption tabular-nums text-text-muted">
          {formatCount(reel.views)} views · {formatDuration(reel.duration)}
        </span>
      </span>

      {watched && <span className="absolute inset-x-0 bottom-0 h-1 bg-brand" aria-hidden="true" />}
    </button>
  );
}

/** The silent hover preview: the reel's scene, muted, on a loop. */
function CardPreview({ reel }) {
  const ref = useRef(null);
  useHls(ref, reel.playbackUrl, true);
  const { start, end } = reel.clip;
  return (
    <video
      ref={ref}
      muted
      playsInline
      crossOrigin="anonymous"
      aria-hidden="true"
      onLoadedMetadata={(e) => {
        e.currentTarget.currentTime = start;
        e.currentTarget.play().catch(() => {});
      }}
      onTimeUpdate={(e) => {
        if (e.currentTarget.currentTime >= end) e.currentTarget.currentTime = start;
      }}
      className="absolute inset-0 h-full w-full animate-fade object-cover"
    />
  );
}

/** A play button inside the logo's orbit (ring and dot); the orbit turns while shown. */
export function OrbitPlay({ className }) {
  return (
    <span className={cn("relative grid h-16 w-16 place-items-center", className)}>
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full motion-safe:animate-[spin_4s_linear_infinite]" aria-hidden="true">
        <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand/70" />
        <circle cx="32" cy="3" r="3.5" className="fill-brand" />
      </svg>
      <span className="molten-glass grid h-11 w-11 place-items-center rounded-full text-brand">
        <Play className="ml-0.5 h-5 w-5 fill-current" />
      </span>
    </span>
  );
}
