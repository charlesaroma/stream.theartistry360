/* Poster Card */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useKeyLight } from "@/hooks/useKeyLight";
import { useProgress } from "@/store/tanstackStore/queries/member";
import { prefetchTitle, useTaxonomy } from "@/store/tanstackStore/queries/site";
import { cardLine } from "@/utils/catalog";
import { cn } from "@/utils/cn";
import AccessLabel from "./AccessLabel";
import PreviewCard from "./PreviewCard";

const OPEN_DELAY = 480; // hover intent: long enough that sweeping across a row doesn't pop cards
const CLOSE_DELAY = 140;

/**
 * 2:3 poster under a key light, with the title on it, the access label
 * bottom-left and year · type · length below. Hovering with intent opens a
 * richer preview with the trailer (desktop pointers only); touch and keyboard
 * go straight to the title page. An orange line shows how far you got.
 */
export default function PosterCard({ title, className, rank }) {
  const ref = useRef(null);
  const light = useKeyLight();
  const { progress } = useProgress();
  const queryClient = useQueryClient();
  // Hover or focus warms the title page before the click.
  const warm = () => prefetchTitle(queryClient, title.id);
  const [rect, setRect] = useState(null);
  const timers = useRef({});
  const p = progress[title.id];
  const { typeName } = useTaxonomy();

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
        onPointerEnter={(e) => { warm(); open(e); }}
        onFocus={warm}
        onPointerLeave={(e) => { light.onPointerLeave(e); close(); }}
        onPointerMove={light.onPointerMove}
        className="keylight relative block aspect-2/3 overflow-hidden rounded-2xl bg-surface-card shadow-[0_10px_30px_rgb(0_0_0/0.5)] outline-offset-4"
      >
        <img src={title.poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
        {rank && (
          <span className="absolute -top-2 right-2 text-[4.5rem] leading-none font-bold text-transparent [-webkit-text-stroke:2px_var(--color-text-primary)] opacity-90" aria-hidden="true">
            {rank}
          </span>
        )}
        <span className="absolute inset-x-2.5 bottom-3 flex flex-col items-start gap-2">
          <span className="line-clamp-2 text-body font-bold leading-snug text-text-primary drop-shadow-[0_1px_4px_rgb(0_0_0/0.8)]">{title.title}</span>
          <AccessLabel title={title} />
        </span>
        {p && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20" aria-hidden="true">
            <span className="block h-full bg-brand" style={{ width: `${(p.seconds / p.duration) * 100}%` }} />
          </span>
        )}
      </Link>
      <p className="mt-2 line-clamp-1 text-caption text-text-muted">{cardLine(title, typeName)}</p>

      {rect && <PreviewCard title={title} rect={rect} onEnter={clear} onLeave={close} />}
    </div>
  );
}
