/* Hero */
import { useEffect, useState } from "react";
import { Check, Info, Play, Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { useWatchlist } from "@/hooks/useLibrary";
import { cn } from "@/utils/cn";
import AccessChip from "./AccessChip";
import MetaLine from "./MetaLine";

const ROTATE_MS = 9000;

/**
 * Full-bleed featured titles (order set in the Studio). Slow Ken Burns push,
 * film grain, crossfade between titles, and a glass progress rail that
 * doubles as the picker. Pauses on hover or focus; still under reduced motion.
 */
export default function Hero({ titles }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { has, toggle } = useWatchlist();
  const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const current = titles[index];

  useEffect(() => {
    if (paused || still || titles.length < 2) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % titles.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [index, paused, still, titles.length]);

  if (!current) return <div className="skeleton h-[min(92svh,56rem)] w-full" />;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="film-grain relative isolate flex min-h-[min(92svh,56rem)] items-end overflow-hidden"
    >
      {/* Backdrops, crossfaded */}
      {titles.map((t, i) => (
        <div key={t.id} aria-hidden={i !== index} className={cn("absolute inset-0 -z-10 transition-opacity duration-1000", i === index ? "opacity-100" : "opacity-0")}>
          <img
            src={t.backdrop || t.poster}
            alt=""
            fetchPriority={i === 0 ? "high" : "low"}
            className={cn("h-full w-full object-cover", i === index && "animate-kenburns")}
          />
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-surface-primary via-surface-primary/20 to-black/40" />

      <div className="shell pb-[clamp(5rem,10vw,8rem)] pt-40">
        <div key={current.id} className="max-w-2xl animate-rise">
          <p className="eyebrow mb-4">Featured</p>
          <h1 className="text-display text-balance">{current.title}</h1>
          <MetaLine title={current} className="mt-5" />
          <p className="mt-5 line-clamp-3 max-w-xl text-lead text-text-secondary">{current.synopsis}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="light" to={`/watch/${current.id}`}>
              <Play className="h-5 w-5 fill-current" aria-hidden="true" /> Play
            </Button>
            <Button variant="glass" to={`/title/${current.id}`}>
              <Info className="h-5 w-5" aria-hidden="true" /> More info
            </Button>
            <IconButton label={has(current.id) ? "Remove from My List" : "Add to My List"} pressed={has(current.id)} onClick={() => toggle(current.id)}>
              {has(current.id) ? <Check className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
            </IconButton>
            <AccessChip access={current.access} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Progress rail: each segment fills while its title is up */}
      {titles.length > 1 && (
        <div data-glass="" className="molten-glass absolute bottom-[clamp(5rem,10vw,8rem)] right-[clamp(1rem,4vw,3.5rem)] hidden gap-2 rounded-full p-2.5 md:flex">
          {titles.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${t.title}`}
              aria-current={i === index}
              className="relative grid h-11 w-11 cursor-pointer place-items-center"
            >
              <span className="relative block h-1 w-full overflow-hidden rounded-full bg-white/25">
                <span
                  key={`${t.id}-${index}-${paused}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-text-primary"
                  style={{
                    width: i < index ? "100%" : i === index ? undefined : "0%",
                    animation: i === index && !paused && !still ? `hero-fill ${ROTATE_MS}ms linear forwards` : undefined,
                    ...(i === index && (paused || still) ? { width: "100%" } : {}),
                  }}
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
