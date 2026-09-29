/* Poster Card */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Play } from "lucide-react";

import { useKeyLight } from "@/hooks/useKeyLight";
import { useMember } from "@/store/context/MemberContext";
import { useProgress, useWatchlist } from "@/store/tanstackStore/queries/member";
import { prefetchTitle, useTaxonomy } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

// Chips and synopsis swap places on hover or keyboard focus.
const HIDE_ON_HOVER = "transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0";
const SHOW_ON_HOVER = "opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100";

/**
 * Clean 2:3 artwork (client's call: nothing written over the poster but a
 * save button and the year), with the title, genre and age rating on the
 * card below it. No price: that shows when someone presses Play.
 *
 * Hover (mouse) and keyboard focus stay inside the card: it lifts, the
 * poster dims, a Play button and two lines of synopsis fade in. Touch goes
 * straight to the title page. An orange line shows progress.
 */
export default function PosterCard({ title, className, rank }) {
  const navigate = useNavigate();
  const location = useLocation();
  const light = useKeyLight();
  const { progress } = useProgress();
  const queryClient = useQueryClient();
  const { typeName, categoryName } = useTaxonomy();
  const { member } = useMember();
  const { has, toggle } = useWatchlist();
  const p = progress[title.id];
  const saved = has(title.id);
  const genre = categoryName(title.categoryIds?.[0]) || typeName(title.type);
  // Hover or focus warms the title page before the click.
  const warm = () => prefetchTitle(queryClient, title.id);
  // Saving needs an account; signed-out viewers are sent to sign in and back.
  const save = () => (member ? toggle(title.id) : navigate(`/sign-in?next=${encodeURIComponent(location.pathname)}`));
  // Every Play goes to the player; without access it bounces to the price gate.
  const play = () => navigate(`/watch/${title.id}`, { viewTransition: true });

  return (
    <div
      onPointerEnter={warm}
      className={cn("group relative rounded-2xl transition-transform duration-300 ease-out hover:-translate-y-1 focus-within:-translate-y-1 motion-reduce:transform-none", className)}
    >
      <Link
        to={`/title/${title.id}`}
        viewTransition
        aria-label={`${title.title}${title.releaseYear ? `, ${title.releaseYear}` : ""}`}
        onFocus={warm}
        onPointerLeave={light.onPointerLeave}
        onPointerMove={light.onPointerMove}
        className="block overflow-hidden rounded-2xl bg-surface-card shadow-[0_10px_30px_rgb(0_0_0/0.45)] ring-1 ring-white/5 outline-offset-4 transition-shadow duration-300 group-hover:shadow-[0_18px_40px_rgb(0_0_0/0.6)] group-hover:ring-2 group-hover:ring-brand/60"
      >
        <span className="keylight relative block aspect-2/3 overflow-hidden rounded-t-2xl">
          <img
            src={title.poster}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05] group-hover:brightness-[0.45] motion-reduce:transform-none"
          />
          {rank && (
            <span className={cn("absolute bottom-2 left-2 rounded-lg bg-brand px-1.5 py-0.5 text-caption font-bold tabular-nums text-black", HIDE_ON_HOVER)} aria-label={`Number ${rank}`}>
              #{rank}
            </span>
          )}
          {title.releaseYear && (
            <span className={cn("absolute bottom-2 right-2 rounded-lg bg-black/75 px-1.5 py-0.5 text-caption font-semibold tabular-nums text-text-primary backdrop-blur-sm", HIDE_ON_HOVER)}>
              {title.releaseYear}
            </span>
          )}
          {title.synopsis && (
            <span className={cn("absolute inset-x-0 bottom-0 line-clamp-2 px-3 pb-3 text-caption leading-snug text-text-secondary", SHOW_ON_HOVER)} aria-hidden="true">
              {title.synopsis}
            </span>
          )}
          {p && (
            <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20" aria-hidden="true">
              <span className="block h-full bg-brand" style={{ width: `${(p.seconds / p.duration) * 100}%` }} />
            </span>
          )}
        </span>
        <span className="flex flex-col gap-1.5 p-3">
          <span className="line-clamp-1 text-small font-semibold text-text-primary transition-colors group-hover:text-brand">{title.title}</span>
          <span className="flex min-w-0 items-center gap-2 text-caption text-text-muted">
            {genre && <span className="truncate">{genre}</span>}
            {title.ageRating && <span className="shrink-0 rounded-md border border-white/15 px-1 leading-4">{title.ageRating}</span>}
          </span>
        </span>
      </Link>

      {/* Buttons sit beside the link, not in it: each is its own tap target */}
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

      {/* Centred on the poster; mouse and keyboard only (a tap opens the page) */}
      <span className="pointer-events-none absolute inset-x-0 top-0 grid aspect-2/3 place-items-center pointer-coarse:hidden">
        <button
          type="button"
          onClick={play}
          aria-label={`Play ${title.title}`}
          className="pointer-events-auto grid h-14 w-14 scale-90 place-items-center rounded-full bg-brand text-black opacity-0 shadow-[0_8px_30px_rgb(0_0_0/0.5)] transition-[opacity,transform,background-color] duration-300 hover:bg-brand-light group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
        >
          <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}
