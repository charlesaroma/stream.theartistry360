/* Reels Grid */
import { Sparkles } from "lucide-react";

import ReelCard from "@/components/title/ReelCard";
import { useWatchedReels } from "@/store/tanstackStore/queries/member";

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7";

/** Every reel in the chosen category and order; a card opens the feed there. */
export default function ReelsGrid({ reels, loading, onOpen, onReset }) {
  const watched = useWatchedReels();

  if (loading) {
    return (
      <div className={`shell ${GRID}`} aria-busy="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-9/16 w-full animate-pulse rounded-xl bg-surface-card/60" />
        ))}
      </div>
    );
  }

  if (!reels.length) {
    return (
      <div className="shell">
        <div className="rounded-3xl border border-dashed border-border-subtle p-12 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-text-muted">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="text-heading text-text-primary">No reels here yet</h2>
          <p className="mt-1 text-small text-text-muted">Try another category.</p>
          <button type="button" onClick={onReset} className="mt-5 min-h-11 text-small font-bold text-brand hover:underline">
            Show all reels
          </button>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="All reels" className={`shell ${GRID}`}>
      {reels.map((reel) => (
        <ReelCard key={reel.id} reel={reel} onOpen={onOpen} watched={watched.has(reel.id)} />
      ))}
    </section>
  );
}
