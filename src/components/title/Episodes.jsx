/* Episodes */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, ChevronDown, Play } from "lucide-react";

import { useProgress } from "@/store/tanstackStore/queries/member";
import { isReleased, listedSeasons, resumeEpisode } from "@/utils/episodes";
import { formatDuration } from "@/utils/format";
import { cn } from "@/utils/cn";

const comingOn = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/**
 * A series' seasons and episodes: a season dropdown, then one row per
 * episode with its still, number, title, length, synopsis and how far you
 * got. Scheduled episodes show their date and can't be opened yet. Every
 * Play goes to /watch, where access is checked (the price gate if needed).
 * `currentId` marks the episode playing on the watch page.
 */
export default function Episodes({ title, currentId = null, className }) {
  const navigate = useNavigate();
  const { progress, episodes: seen } = useProgress();
  const seasons = listedSeasons(title);
  // Open on the season of the episode playing, else the one you'd continue.
  const startEp = currentId ?? resumeEpisode(title, progress, seen)?.episode.id;
  const [seasonNo, setSeasonNo] = useState(() => seasons.find((s) => s.episodes.some((e) => e.id === startEp))?.number ?? seasons[0]?.number);
  const season = seasons.find((s) => s.number === seasonNo) ?? seasons[0];
  if (!season) return null;

  return (
    <section aria-labelledby="episodes-title" className={className}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 id="episodes-title" className="text-heading">Episodes</h2>
        {seasons.length > 1 ? (
          <label className="relative">
            <span className="sr-only">Season</span>
            <select
              value={season.number}
              onChange={(e) => setSeasonNo(Number(e.target.value))}
              className="min-h-11 cursor-pointer appearance-none rounded-full border border-white/15 bg-surface-card py-2 pl-5 pr-11 text-small font-semibold text-text-primary hover:border-white/30"
            >
              {seasons.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.title || `Season ${s.number}`} ({s.episodes.length} {s.episodes.length === 1 ? "episode" : "episodes"})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
          </label>
        ) : (
          <p className="text-small text-text-secondary">{season.title || `Season ${season.number}`}</p>
        )}
      </div>

      <ol className="flex flex-col gap-2">
        {season.episodes.map((e) => {
          const out = isReleased(e);
          const p = seen[e.id];
          const pct = p?.done ? 100 : p?.duration ? (p.seconds / p.duration) * 100 : 0;
          const current = e.id === currentId;
          return (
            <li key={e.id}>
              <button
                type="button"
                disabled={!out || current}
                onClick={() => navigate(`/watch/${title.id}?ep=${e.id}`, { viewTransition: true })}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "group grid w-full grid-cols-[7.5rem_minmax(0,1fr)] gap-4 rounded-2xl p-2 text-left transition-colors sm:grid-cols-[2rem_11rem_minmax(0,1fr)] sm:items-center sm:p-3",
                  current ? "bg-white/8 ring-1 ring-brand/50" : out ? "cursor-pointer hover:bg-white/5" : "cursor-default opacity-60",
                )}
              >
                <span className="hidden text-center text-heading tabular-nums text-text-muted sm:block">{e.number}</span>
                <span className="relative block aspect-video overflow-hidden rounded-xl bg-surface-card">
                  {e.still && <img src={e.still} alt="" loading="lazy" className="h-full w-full object-cover" />}
                  {out && !current && (
                    <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-text-primary text-black"><Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" /></span>
                    </span>
                  )}
                  {pct > 0 && (
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20" aria-hidden="true"><span className="block h-full bg-brand" style={{ width: `${pct}%` }} /></span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-body font-semibold text-text-primary"><span className="sm:hidden">{e.number}. </span>{e.title}</span>
                    <span className="shrink-0 text-caption tabular-nums text-text-muted">
                      {current ? <span className="font-bold text-brand">Now playing</span> : out ? formatDuration(e.video?.duration) : (
                        <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> {comingOn(e.releaseAt)}</span>
                      )}
                    </span>
                  </span>
                  {e.synopsis && <span className="mt-1 line-clamp-2 block text-small text-text-secondary">{e.synopsis}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
