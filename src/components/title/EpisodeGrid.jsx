/* Episode Grid */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { useProgress } from "@/store/tanstackStore/queries/member";
import { isReleased, listedSeasons } from "@/utils/episodes";
import { cn } from "@/utils/cn";

/**
 * Episodes as a grid of numbers beside the player: quick to scan and jump
 * through, even for long seasons. The playing one is filled, watched ones are
 * tinted, started ones are ringed; scheduled ones can't be opened yet.
 */
export default function EpisodeGrid({ title, currentId }) {
  const navigate = useNavigate();
  const { episodes: seen } = useProgress();
  const seasons = listedSeasons(title);
  const [seasonNo, setSeasonNo] = useState(() => seasons.find((s) => s.episodes.some((e) => e.id === currentId))?.number ?? seasons[0]?.number);
  const season = seasons.find((s) => s.number === seasonNo) ?? seasons[0];
  const current = season?.episodes.find((e) => e.id === currentId);
  if (!season) return null;

  return (
    <section aria-labelledby="episode-grid-title" className="rounded-2xl border border-white/8 bg-surface-card/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="episode-grid-title" className="text-small font-bold uppercase tracking-[0.15em] text-text-secondary">Episodes</h2>
        {seasons.length > 1 && (
          <label className="relative">
            <span className="sr-only">Season</span>
            <select value={season.number} onChange={(e) => setSeasonNo(Number(e.target.value))} className="min-h-9 cursor-pointer appearance-none rounded-lg border border-white/10 bg-surface-primary py-1 pl-3 pr-8 text-caption font-semibold text-text-primary">
              {seasons.map((s) => <option key={s.number} value={s.number}>{s.title || `Season ${s.number}`}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          </label>
        )}
      </div>
      <ol className="grid grid-cols-5 gap-1.5">
        {season.episodes.map((e) => {
          const out = isReleased(e);
          const p = seen[e.id];
          const playing = e.id === currentId;
          return (
            <li key={e.id}>
              <button
                type="button"
                disabled={!out || playing}
                onClick={() => navigate(`/watch/${title.id}?ep=${e.id}`, { viewTransition: true })}
                aria-current={playing ? "true" : undefined}
                aria-label={`Episode ${e.number}: ${e.title}${playing ? " (playing)" : p?.done ? " (watched)" : ""}${out ? "" : " (coming soon)"}`}
                title={out ? e.title : `${e.title} (coming soon)`}
                className={cn(
                  "grid h-11 w-full place-items-center rounded-lg text-small font-semibold tabular-nums transition-colors",
                  playing ? "bg-brand text-black" : p?.done ? "bg-brand/15 text-brand hover:bg-brand/25" : "bg-white/6 text-text-secondary hover:bg-white/12 hover:text-text-primary",
                  p && !p.done && !playing && "ring-1 ring-inset ring-brand/60",
                  !out && "cursor-not-allowed opacity-35",
                )}
              >
                {e.number}
              </button>
            </li>
          );
        })}
      </ol>
      {current && <p className="mt-3 text-caption text-text-muted">You're watching <span className="font-semibold text-brand">Episode {current.number}</span>: {current.title}</p>}
    </section>
  );
}
