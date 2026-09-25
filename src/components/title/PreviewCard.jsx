/* Preview Card */
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronRight, Play, Plus } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import { useProgress, useWatchlist } from "@/hooks/useLibrary";
import AccessChip from "./AccessChip";
import MetaLine from "./MetaLine";

const WIDTH = 360;

/**
 * The hover-intent preview. Rendered in a portal so a row's horizontal
 * scroller cannot clip it; placed over the card and kept inside the viewport.
 */
export default function PreviewCard({ title, rect, onEnter, onLeave }) {
  const navigate = useNavigate();
  const { has, toggle } = useWatchlist();
  const { progress } = useProgress();
  const p = progress[title.id];
  const w = Math.max(WIDTH, rect.width * 1.6);
  const left = Math.min(Math.max(rect.left + rect.width / 2 - w / 2, 16), window.innerWidth - w - 16);
  const top = Math.max(rect.top - 40, 16);

  return createPortal(
    <div
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{ left, top, width: w }}
      className="fixed z-60 animate-rise overflow-hidden rounded-3xl border border-white/10 bg-surface-elevated shadow-[0_30px_80px_rgb(0_0_0/0.7)]"
    >
      <Link to={`/title/${title.id}`} viewTransition className="relative block aspect-video overflow-hidden" tabIndex={-1}>
        <img src={title.backdrop || title.poster} alt="" className="h-full w-full animate-kenburns object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-surface-elevated via-transparent to-transparent" />
        {p && (
          <div className="absolute inset-x-4 bottom-3 h-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(p.seconds / p.duration) * 100}%` }} />
          </div>
        )}
      </Link>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <IconButton label={p ? "Resume" : "Play"} onClick={() => navigate(`/watch/${title.id}`, { viewTransition: true })} className="h-11 w-11 bg-text-primary text-black hover:bg-white">
            <Play className="h-5 w-5 fill-current" aria-hidden="true" />
          </IconButton>
          <IconButton label={has(title.id) ? "Remove from My List" : "Add to My List"} pressed={has(title.id)} onClick={() => toggle(title.id)} className="h-11 w-11">
            {has(title.id) ? <Check className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
          </IconButton>
          <IconButton label="More info" onClick={() => navigate(`/title/${title.id}`, { viewTransition: true })} className="ml-auto h-11 w-11">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>
        <div>
          <h3 className="text-subheading line-clamp-1 font-bold">{title.title}</h3>
          <MetaLine title={title} className="mt-1" />
        </div>
        <p className="line-clamp-2 text-small text-text-secondary">{title.synopsis}</p>
        <AccessChip access={title.access} className="self-start" />
      </div>
    </div>,
    document.body,
  );
}
