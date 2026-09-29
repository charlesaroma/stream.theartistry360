/* Featured Reel */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Clapperboard, Play } from "lucide-react";

import ReelCard from "@/components/title/ReelCard";
import Button from "@/components/ui/Button";
import { useHls } from "@/hooks/useHls";
import { useReelFilm } from "@/hooks/useReelFilm";
import { useWatchedReels } from "@/store/tanstackStore/queries/member";
import { formatDuration } from "@/utils/format";
import { canAutoplay, categoryOf, formatCount } from "@/utils/reels";

/**
 * The page's moving centrepiece: the Studio's featured reel, large and
 * playing silently (only while on screen, and only when motion and data
 * allow), its details and the way into its film, and the next few reels.
 */
export default function FeaturedReel({ reel, upNext, onOpen, paused = false }) {
  const frame = useRef(null);
  const [onScreen, setOnScreen] = useState(false);
  const filmFor = useReelFilm();
  const watched = useWatchedReels();
  const film = filmFor(reel);
  const category = categoryOf(reel.category);

  useEffect(() => {
    const el = frame.current;
    if (!el || !canAutoplay()) return undefined;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="featured-reel" className="shell grid gap-6 pb-10 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-10">
      <button
        ref={frame}
        type="button"
        onClick={() => onOpen(reel)}
        aria-label={`Play featured reel: ${reel.title}`}
        className="relative aspect-9/16 w-full max-w-72 cursor-pointer overflow-hidden rounded-2xl bg-surface-card shadow-[0_20px_50px_rgb(0_0_0/0.6)] outline-offset-4 focus-visible:ring-2 focus-visible:ring-brand md:max-w-none"
      >
        <img src={reel.poster} alt="" className="h-full w-full object-cover" />
        {/* Not behind the open feed: one stream at a time */}
        {onScreen && !paused && <SilentScene reel={reel} />}
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-caption font-semibold text-text-primary backdrop-blur-xs">Featured</span>
      </button>

      <div className="flex min-w-0 flex-col justify-center gap-4">
        {category && (
          <p className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.18em] text-text-muted">
            <span className={`h-2 w-2 rounded-full ${category.dot}`} aria-hidden="true" />
            {category.one}
          </p>
        )}
        <h2 id="featured-reel" className="text-title text-balance">{reel.title}</h2>
        {reel.talent && (
          <p className="flex items-center gap-2.5 text-small">
            {reel.talent.avatar && <img src={reel.talent.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <span className="font-semibold text-text-primary">{reel.talent.name}</span>
            <span className="text-text-muted">· {reel.talent.role}</span>
          </p>
        )}
        <p className="max-w-2xl text-body text-text-secondary">{reel.caption}</p>
        <p className="text-small tabular-nums text-text-muted">{formatCount(reel.views)} views · {formatDuration(reel.duration)}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => onOpen(reel)} className="gap-2 px-5 font-bold">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            Watch from here
          </Button>
          {film && (
            <Link to={film.watchTo} viewTransition className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-subtle px-5 text-small font-semibold text-text-primary hover:border-brand">
              <Clapperboard className="h-4 w-4 text-brand" aria-hidden="true" />
              From {film.name} · Watch the film
            </Link>
          )}
        </div>

        {upNext.length > 0 && (
          <div className="mt-2">
            <p className="mb-3 text-caption font-semibold uppercase tracking-[0.18em] text-text-muted">Up next</p>
            <div className="grid max-w-2xl grid-cols-3 gap-3 sm:grid-cols-4">
              {upNext.map((r) => (
                <ReelCard key={r.id} reel={r} onOpen={onOpen} watched={watched.has(r.id)} className="rounded-lg" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** The featured scene, muted, looping; mounted only while on screen. */
function SilentScene({ reel }) {
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
