/* Centre Flash */
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";

const ICONS = { play: Play, pause: Pause, back: RotateCcw, forward: RotateCw };

/**
 * The big icon that answers a play, pause or skip, in the middle of the
 * picture, then fades. Keyed on each press so repeated presses replay it.
 */
export default function CenterFlash({ flash }) {
  if (!flash) return null;
  const { kind, id } = flash;
  const Glyph = ICONS[kind];
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center" aria-hidden="true">
      <span key={id} className="grid h-24 w-24 animate-[flash_650ms_var(--ease-out-soft)_forwards] place-items-center rounded-full bg-black/55 backdrop-blur-md">
        <Glyph className={kind === "play" || kind === "pause" ? "h-11 w-11 fill-current" : "h-10 w-10"} />
        {(kind === "back" || kind === "forward") && <span className="absolute bottom-4 text-caption font-bold">10s</span>}
      </span>
    </div>
  );
}
