/* Row */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import { cn } from "@/utils/cn";

/**
 * A titled horizontal shelf. The track bleeds to the viewport edge but its
 * first item aligns with the page gutter; arrows page by one screen and
 * appear only when there is somewhere to go.
 */
export default function Row({ title, subtitle, seeAll, items, render, itemClassName = "w-[clamp(8.75rem,13vw,12.5rem)]" }) {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = () => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  const page = (dir) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: "smooth" });

  if (!items.length) return null;

  return (
    <section className="group/row relative" aria-label={title}>
      <header className="shell mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-heading">{title}</h2>
          {subtitle && <p className="mt-1 text-small text-text-muted">{subtitle}</p>}
        </div>
        {seeAll && (
          <Link to={seeAll} viewTransition className="inline-flex min-h-11 items-center gap-1 text-small font-bold text-brand hover:text-brand-300">
            See all <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </header>

      <div className="relative">
        <ul
          ref={track}
          onScroll={measure}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] pb-4 pt-1 scroll-px-[clamp(1rem,4vw,3.5rem)] md:gap-5"
        >
          {items.map((item, i) => (
            <li key={item.id} className={cn("shrink-0 snap-start", itemClassName)}>{render(item, i)}</li>
          ))}
        </ul>
        {/* Edge fades hint that the shelf scrolls */}
        <div className={cn("pointer-events-none absolute inset-y-0 left-0 w-[clamp(1rem,4vw,3.5rem)] bg-linear-to-r from-surface-primary transition-opacity", edges.start && "opacity-0")} />
        <div className={cn("pointer-events-none absolute inset-y-0 right-0 w-[clamp(1rem,4vw,3.5rem)] bg-linear-to-l from-surface-primary transition-opacity", edges.end && "opacity-0")} />
        {!edges.start && (
          <IconButton label={`Scroll ${title} back`} onClick={() => page(-1)} className="absolute left-3 top-[40%] z-10 hidden -translate-y-1/2 opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 md:inline-grid">
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </IconButton>
        )}
        {!edges.end && (
          <IconButton label={`Scroll ${title} forward`} onClick={() => page(1)} className="absolute right-3 top-[40%] z-10 hidden -translate-y-1/2 opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 md:inline-grid">
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </IconButton>
        )}
      </div>
    </section>
  );
}
