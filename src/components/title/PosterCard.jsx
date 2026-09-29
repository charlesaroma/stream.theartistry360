/* Poster Card */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { useKeyLight } from "@/hooks/useKeyLight";
import { useMember } from "@/store/context/MemberContext";
import { useProgress, useWatchlist } from "@/store/tanstackStore/queries/member";
import { prefetchTitle, useTaxonomy } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import AgeBadge from "./AgeBadge";
import PreviewCard from "./PreviewCard";

const OPEN_DELAY = 480; // hover intent: long enough that sweeping across a row doesn't pop cards
const CLOSE_DELAY = 140;

/**
 * Clean 2:3 artwork (client's call: nothing written over the poster but a
 * save button and the year), with the title, genre and age rating on the
 * card below it. No price: that shows when someone presses Play. Hovering
 * with intent opens a richer preview with the trailer (desktop pointers
 * only); touch and keyboard go straight to the title page. An orange line
 * shows how far you got.
 */
export default function PosterCard({ title, className, rank }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const light = useKeyLight();
  const { progress } = useProgress();
  const queryClient = useQueryClient();
  const { typeName, categoryName } = useTaxonomy();
  const { member } = useMember();
  const { has, toggle } = useWatchlist();
  const [rect, setRect] = useState(null);
  const timers = useRef({});
  const p = progress[title.id];
  const saved = has(title.id);
  const genre = categoryName(title.categoryIds?.[0]) || typeName(title.type);
  // Hover or focus warms the title page before the click.
  const warm = () => prefetchTitle(queryClient, title.id);
  // Saving needs an account; signed-out viewers are sent to sign in and back.
  const save = () => (member ? toggle(title.id) : navigate(`/sign-in?next=${encodeURIComponent(location.pathname)}`));

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
        aria-label={`${title.title}${title.releaseYear ? `, ${title.releaseYear}` : ""}`}
        onPointerEnter={(e) => { warm(); open(e); }}
        onFocus={warm}
        onPointerLeave={(e) => { light.onPointerLeave(e); close(); }}
        onPointerMove={light.onPointerMove}
        className="block overflow-hidden rounded-2xl bg-surface-card shadow-[0_10px_30px_rgb(0_0_0/0.45)] ring-1 ring-white/5 outline-offset-4"
      >
        <span className="keylight relative block aspect-2/3 overflow-hidden rounded-t-2xl">
          <img src={title.poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          {rank && (
            <span className="absolute bottom-2 left-2 rounded-lg bg-brand px-1.5 py-0.5 text-caption font-bold tabular-nums text-black" aria-label={`Number ${rank}`}>
              #{rank}
            </span>
          )}
          {title.releaseYear && (
            <span className="absolute bottom-2 right-2 rounded-lg bg-black/75 px-1.5 py-0.5 text-caption font-semibold tabular-nums text-text-primary backdrop-blur-sm">
              {title.releaseYear}
            </span>
          )}
          {p && (
            <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20" aria-hidden="true">
              <span className="block h-full bg-brand" style={{ width: `${(p.seconds / p.duration) * 100}%` }} />
            </span>
          )}
        </span>
        <span className="flex flex-col gap-1.5 p-3">
          <span className="line-clamp-1 text-small font-semibold text-text-primary">{title.title}</span>
          <span className="flex min-w-0 items-center gap-2 text-caption text-text-muted">
            {genre && <span className="truncate">{genre}</span>}
            <AgeBadge value={title.ageRating} />
          </span>
        </span>
      </Link>

      {/* Beside the link, not in it: its own tap target */}
      <button
        type="button"
        onClick={save}
        aria-pressed={member ? saved : undefined}
        aria-label={saved ? `Remove ${title.title} from My List` : `Save ${title.title} to My List`}
        className={cn(
          "absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-xl backdrop-blur-sm transition-colors",
          saved ? "bg-brand text-black" : "bg-black/60 text-text-primary hover:bg-black/80",
        )}
      >
        {saved ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
      </button>

      {rect && <PreviewCard title={title} rect={rect} onEnter={clear} onLeave={close} />}
    </div>
  );
}
