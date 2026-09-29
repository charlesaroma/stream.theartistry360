/* Reel Info */
import { Link } from "react-router-dom";
import { Clapperboard } from "lucide-react";

import { formatDuration } from "@/utils/format";

/**
 * What a reel is, and the way into its film. "Watch the film" opens the
 * film at this scene when the member can watch it (otherwise its page), so a
 * free clip turns into a film view or a subscription. The feed is left open
 * on purpose: its place is in the URL, so Back returns to this clip.
 */
export default function ReelInfo({ reel, film }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2.5 bg-linear-to-t from-black/90 via-black/60 to-transparent p-4 pr-18 pt-16">
      {reel.talent && (
        <p className="text-small leading-tight">
          <span className="font-bold text-text-primary">{reel.talent.name}</span>
          <span className="text-text-muted"> · {reel.talent.role}</span>
        </p>
      )}
      <div>
        <h2 className="text-subheading font-bold text-text-primary drop-shadow-sm">{reel.title}</h2>
        <p className="mt-1 line-clamp-3 text-small leading-snug text-text-secondary">{reel.caption}</p>
      </div>
      {film && (
        <Link
          to={film.watchTo}
          viewTransition
          title={film.canWatch ? `Starts at ${formatDuration(reel.clip.start)}` : "Opens the film's page, where you can sign in, subscribe or buy it"}
          className="group/film inline-flex min-h-11 max-w-full items-center gap-2 self-start rounded-full bg-white/12 py-1 pl-3 pr-1 text-caption font-semibold text-text-primary backdrop-blur-md transition-colors hover:bg-white/20"
        >
          <Clapperboard className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <span className="truncate">From {film.name}</span>
          <span className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-black transition-colors group-hover/film:bg-white">
            Watch the film{film.canWatch ? ` · ${formatDuration(reel.clip.start)}` : ""}
          </span>
        </Link>
      )}
    </div>
  );
}
