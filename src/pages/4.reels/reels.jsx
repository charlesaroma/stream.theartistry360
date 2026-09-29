/* Reels Page */
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Play, Sparkles } from "lucide-react";

import PageIntro from "@/components/layout/PageIntro";
import ReelViewer from "@/components/player/ReelViewer";
import ReelCard from "@/components/title/ReelCard";
import Button from "@/components/ui/Button";
import { useReels } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

const CATEGORIES = [
  { id: "", label: "All Clips" },
  { id: "monologue", label: "Monologues" },
  { id: "highlight", label: "Scene Cuts" },
  { id: "bts", label: "Behind The Scenes" },
  { id: "audition", label: "Audition Lab" },
];

const SORTS = [
  { id: "popular", label: "Most Watched" },
  { id: "likes", label: "Most Liked" },
  { id: "new", label: "Latest" },
];

/**
 * Dedicated Reels page (/reels).
 * Showcases short-form cinema clips, monologues, scene cuts, and audition reels
 * in a responsive 9:16 grid with category filtering and an immersive feed viewer.
 */
export default function ReelsPage() {
  const [params, setParams] = useSearchParams();
  const { data: reels = [], isLoading } = useReels();

  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "popular";

  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const filtered = reels.filter((r) => !category || r.category === category);
    if (sort === "likes") return filtered.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    if (sort === "new") return [...filtered].reverse();
    return filtered.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  }, [reels, category, sort]);

  // A shared link (/reels?reel=<id>) opens the viewer on that reel once the list is in.
  const sharedId = params.get("reel");
  const [openedShared, setOpenedShared] = useState(null);
  if (sharedId && sharedId !== openedShared && list.length) {
    setOpenedShared(sharedId);
    const idx = list.findIndex((r) => r.id === sharedId);
    if (idx >= 0) {
      setActiveIndex(idx);
      setViewerOpen(true);
    }
  }

  const closeViewer = () => {
    setViewerOpen(false);
    if (sharedId) set("reel", "");
  };

  const handleOpenAt = (reel) => {
    const idx = list.findIndex((r) => r.id === reel.id);
    setActiveIndex(idx >= 0 ? idx : 0);
    setViewerOpen(true);
  };

  const handlePlayAll = () => {
    setActiveIndex(0);
    setViewerOpen(true);
  };

  return (
    <>
      <PageIntro
        eyebrow="Spotlight & Quick Takes"
        title="Reels"
        lead="Short-form monologues, scene highlights, audition tapes, and behind-the-scenes moments from Artistry360 screen productions."
      >
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Filter Chips */}
          <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set("category", c.id)}
                  className={cn(
                    "ember min-h-11 shrink-0 cursor-pointer rounded-full border px-4 text-small font-semibold transition-colors",
                    active
                      ? "border-brand bg-brand text-black shadow-[0_0_16px_color-mix(in_oklab,var(--color-brand)_40%,transparent)]"
                      : "border-border-subtle text-text-secondary hover:border-border-hover hover:text-text-primary",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Right Action: Play Feed CTA & Sort */}
          <div className="flex items-center gap-3">
            <select
              value={sort}
              aria-label="Sort reels"
              onChange={(e) => set("sort", e.target.value)}
              className="min-h-11 rounded-full border border-border-subtle bg-surface-card px-4 text-small font-medium text-text-primary transition-colors hover:border-border-hover focus-visible:outline-brand"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {list.length > 0 && (
              <Button
                variant="primary"
                onClick={handlePlayAll}
                className="gap-2 px-5 font-bold"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>Play Feed</span>
              </Button>
            )}
          </div>
        </div>
      </PageIntro>

      {/* Grid of Reels */}
      <section className="shell pb-[clamp(3rem,6vw,6rem)]" aria-label="Reels catalogue">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-9/16 w-full animate-pulse rounded-2xl bg-surface-card/60"
              />
            ))}
          </div>
        ) : list.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-5">
            {list.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                onOpen={handleOpenAt}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border-subtle p-12 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-text-muted">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-heading text-text-primary">No clips found</h2>
            <p className="mt-1 text-small text-text-muted">
              Try selecting another category or resetting filters.
            </p>
            <button
              type="button"
              onClick={() => {
                set("category", "");
                set("sort", "popular");
              }}
              className="mt-5 text-small font-bold text-brand hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Immersive Vertical Player Modal */}
      <ReelViewer
        open={viewerOpen}
        reels={list}
        activeIndex={activeIndex}
        onClose={closeViewer}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
