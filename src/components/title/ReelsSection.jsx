/* Reels Section */
import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import ReelViewer from "@/components/player/ReelViewer";
import ReelCard from "@/components/title/ReelCard";
import { useReels } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

const CATEGORY_FILTERS = [
  { id: "all", label: "All Clips" },
  { id: "monologue", label: "Monologues" },
  { id: "highlight", label: "Scene Cuts" },
  { id: "bts", label: "Behind The Scenes" },
  { id: "audition", label: "Audition Lab" },
];

/**
 * A dedicated shelf showcasing 9:16 vertical cinema reels, monologues,
 * scene cuts, and student audition highlights. Clicking any card launches
 * the full-immersion ReelViewer modal.
 */
export default function ReelsSection({
  title = "Reels & Spotlight Clips",
  subtitle = "Monologues, scene cuts, and behind-the-scenes moments from the Artistry360 screen.",
}) {
  const { data: reels = [] } = useReels();
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const filteredReels = useMemo(() => {
    if (activeCategory === "all") return reels;
    return reels.filter((r) => r.category === activeCategory);
  }, [reels, activeCategory]);

  const measure = () => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    });
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [filteredReels.length]);

  const page = (dir) => {
    track.current?.scrollBy({
      left: dir * track.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const handleOpen = (reel) => {
    const idx = reels.findIndex((r) => r.id === reel.id);
    setActiveIndex(idx >= 0 ? idx : 0);
    setViewerOpen(true);
  };

  if (!reels.length) return null;

  return (
    <section className="group/reels relative my-2" aria-label={title}>
      {/* Header aligned with the gutter */}
      <header className="shell mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/15 text-brand">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <h2 className="text-heading text-text-primary">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 text-small text-text-muted">{subtitle}</p>}
        </div>

        {/* Category Filter Pills & See All Link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORY_FILTERS.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={active}
                  className={cn(
                    "min-h-9 rounded-full px-3.5 py-1.5 text-caption font-semibold transition-all cursor-pointer whitespace-nowrap",
                    active
                      ? "bg-brand text-surface-primary shadow-[0_0_14px_color-mix(in_oklab,var(--color-brand)_40%,transparent)]"
                      : "bg-surface-card/60 text-text-secondary hover:bg-white/10 hover:text-text-primary",
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <Link
            to="/reels"
            viewTransition
            className="inline-flex min-h-11 shrink-0 items-center gap-1 text-small font-bold text-brand hover:text-brand-300"
          >
            <span>See all</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Reel Shelf Track */}
      <div className="relative">
        <ul
          ref={track}
          onScroll={measure}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] pb-4 pt-1 scroll-px-[clamp(1rem,4vw,3.5rem)] md:gap-5"
        >
          {filteredReels.map((reel) => (
            <li
              key={reel.id}
              className="w-[clamp(11rem,15vw,14.5rem)] shrink-0 snap-start"
            >
              <ReelCard reel={reel} onOpen={handleOpen} />
            </li>
          ))}
        </ul>

        {/* Edge gradient hints */}
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-[clamp(1rem,4vw,3.5rem)] bg-linear-to-r from-surface-primary transition-opacity duration-300",
            edges.start && "opacity-0",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-[clamp(1rem,4vw,3.5rem)] bg-linear-to-l from-surface-primary transition-opacity duration-300",
            edges.end && "opacity-0",
          )}
        />

        {/* Desktop Navigation Arrows */}
        {!edges.start && (
          <IconButton
            label="Scroll reels back"
            onClick={() => page(-1)}
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 opacity-0 transition-opacity group-hover/reels:opacity-100 focus-visible:opacity-100 md:inline-grid"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </IconButton>
        )}
        {!edges.end && (
          <IconButton
            label="Scroll reels forward"
            onClick={() => page(1)}
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 opacity-0 transition-opacity group-hover/reels:opacity-100 focus-visible:opacity-100 md:inline-grid"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </IconButton>
        )}
      </div>

      {/* Reel Modal Player */}
      <ReelViewer
        open={viewerOpen}
        reels={reels}
        activeIndex={activeIndex}
        onClose={() => setViewerOpen(false)}
        onNavigate={setActiveIndex}
      />
    </section>
  );
}
