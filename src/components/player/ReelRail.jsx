/* Reel Rail */
import { useState } from "react";
import { Check, Heart, Plus, Share2 } from "lucide-react";

import { cn } from "@/utils/cn";
import { formatCount } from "@/utils/reels";

const glass = "molten-glass grid h-12 w-12 place-items-center rounded-full transition-transform active:scale-90";

/**
 * The right-hand actions on a reel: like, share, and "My List" for the film
 * the scene comes from. No creator photo: every reel is The Artistry360's own,
 * so the channel-style avatar other apps show would say nothing.
 */
export default function ReelRail({ reel, liked, onToggleLike, film, inList, onToggleList }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/reels?reel=${reel.id}`;
    const data = { title: `${reel.title} — Artistry360 Reels`, text: reel.caption, url };
    if (navigator.share && navigator.canShare?.(data)) {
      try { await navigator.share(data); return; } catch { /* dismissed: fall back to copying */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing else to offer.
    }
  };

  return (
    <div className="absolute bottom-36 right-3 z-30 flex flex-col items-center gap-4 text-center">
      <RailButton label={liked ? "Unlike reel" : "Like reel"} caption={formatCount(reel.likes + (liked ? 1 : 0))} onClick={onToggleLike}>
        <span className={cn(glass, liked ? "text-brand shadow-[0_0_16px_color-mix(in_oklab,var(--color-brand)_60%,transparent)]" : "text-text-primary hover:text-brand")}>
          <Heart className={cn("h-6 w-6", liked && "fill-current")} aria-hidden="true" />
        </span>
      </RailButton>
      <RailButton label="Share reel" caption={copied ? "Copied" : "Share"} onClick={share}>
        <span className={cn(glass, "text-text-primary hover:text-brand")}>
          {copied ? <Check className="h-6 w-6 text-success" aria-hidden="true" /> : <Share2 className="h-6 w-6" aria-hidden="true" />}
        </span>
      </RailButton>
      {film && (
        <RailButton
          label={inList ? `Remove ${film.name} from My List` : `Add ${film.name} to My List`}
          caption={inList ? "In My List" : "My List"}
          onClick={onToggleList}
          pressed={inList}
        >
          <span className={cn(glass, inList ? "text-brand" : "text-text-primary hover:text-brand")}>
            {inList ? <Check className="h-6 w-6" aria-hidden="true" /> : <Plus className="h-6 w-6" aria-hidden="true" />}
          </span>
        </RailButton>
      )}
    </div>
  );
}

function RailButton({ label, caption, onClick, pressed, children }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={pressed} className="flex flex-col items-center gap-1">
      {children}
      <span className="text-caption font-semibold text-text-primary drop-shadow-md">{caption}</span>
    </button>
  );
}
