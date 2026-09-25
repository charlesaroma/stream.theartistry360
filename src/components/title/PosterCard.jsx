/* Poster Card */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useKeyLight } from "@/hooks/useKeyLight";
import { useProgress } from "@/hooks/useLibrary";
import { cn } from "@/utils/cn";
import AccessChip from "./AccessChip";
import PreviewCard from "./PreviewCard";

const OPEN_DELAY = 480; // hover intent: long enough that sweeping across a row doesn't pop cards
const CLOSE_DELAY = 140;

/**
 * 2:3 poster under a key light. Hovering with intent opens a richer preview
 * (desktop pointers only); touch and keyboard go straight to the title page.
 */
export default function PosterCard({ title, className, rank }) {
  const ref = useRef(null);
  const light = useKeyLight();
  const { progress } = useProgress();
  const [rect, setRect] = useState(null);
  const timers = useRef({});
  const p = progress[title.id];

  const clear = () => {
    clearTimeout(timers.current.open);
    clearTimeout(timers.current.close);
  };
  const open = (e) => {
    if (e.pointerType !== "mouse" || !window.matchMedia("(hover: hover)").matches) return;
    clear();
    timers.current.open = setTimeout(() => setRect(ref.current?.getBoundingClientRect() ?? null), OPEN_DELAY);
  };
  const close = () => {
    clear();
    timers.current.close = setTimeout(() => setRect(null), CLOSE_DELAY);
  };

  // Any scroll invalidates the preview's position.
  useEffect(() => {
    if (!rect) return undefined;
    const shut = () => setRect(null);
    window.addEventListener("scroll", shut, { passive: true, capture: true });
    window.addEventListener("resize", shut);
    return () => {
      window.removeEventListener("scroll", shut, { capture: true });
      window.removeEventListener("resize", shut);
    };
  }, [rect]);
  useEffect(() => () => clear(), []);

  return (
    <div className={cn("group relative", className)}>
      <Link
        ref={ref}
        to={`/title/${title.id}`}
        viewTransition
        onPointerEnter={open}
        onPointerLeave={(e) => { light.onPointerLeave(e); close(); }}
        onPointerMove={light.onPointerMove}
        className="keylight relative block aspect-2/3 overflow-hidden rounded-2xl bg-surface-card shadow-[0_10px_30px_rgb(0_0_0/0.5)] outline-offset-4"
      >
        <img src={title.poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-80" />
        {rank && (
          <span className="absolute -bottom-3 left-2 text-[5.5rem] leading-none font-bold text-transparent [-webkit-text-stroke:2px_var(--color-text-primary)] opacity-90" aria-hidden="true">
            {rank}
          </span>
        )}
        <AccessChip access={title.access} className="absolute left-2.5 top-2.5 backdrop-blur-md" />
        {p && (
          <div className="absolute inset-x-2.5 bottom-2.5 h-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(p.seconds / p.duration) * 100}%` }} />
          </div>
        )}
        <span className="sr-only">{title.title}</span>
      </Link>
      <p className="mt-3 line-clamp-1 text-small font-semibold text-text-primary">{title.title}</p>
      <p className="text-caption text-text-muted">{title.releaseYear}</p>

      {rect && <PreviewCard title={title} rect={rect} onEnter={clear} onLeave={close} />}
    </div>
  );
}
