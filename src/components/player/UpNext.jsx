/* Up Next */
import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

const COUNTDOWN = 8;

/** When a title ends: the next suggestion, starting on its own after a short count. */
export default function UpNext({ next, onPlay, onCancel }) {
  const [left, setLeft] = useState(COUNTDOWN);
  useEffect(() => {
    if (left <= 0) {
      onPlay();
      return undefined;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onPlay]);

  return (
    <div data-glass="" className="molten-glass absolute bottom-24 right-[clamp(1rem,3vw,2rem)] z-20 flex w-[min(24rem,calc(100%-2rem))] animate-rise gap-4 rounded-2xl bg-black/60 p-4">
      <img src={next.backdrop || next.poster} alt="" className="aspect-video w-28 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="text-caption font-bold uppercase tracking-[0.18em] text-text-muted">Up next in {left}s</p>
        <p className="mt-1 truncate text-small font-bold">{next.title}</p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onPlay} className="btn btn-light ember min-h-9 px-4 text-caption"><Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> Play now</button>
          <button type="button" onClick={onCancel} aria-label="Cancel" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-white/10"><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
}
