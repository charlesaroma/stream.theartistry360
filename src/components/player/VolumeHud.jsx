/* Volume Hud */
import { Volume1, Volume2, VolumeX } from "lucide-react";

/**
 * The level readout in the middle of the picture while the volume changes
 * (slider, arrow keys, M). Unlike CenterFlash it holds still while you keep
 * adjusting, then fades a moment after the last change. The slider itself
 * announces the value to assistive tech, so this is visual only.
 */
export default function VolumeHud({ hud }) {
  if (!hud) return null;
  const { volume, muted } = hud;
  const level = muted ? 0 : Math.round(volume * 100);
  const Glyph = level === 0 ? VolumeX : level < 50 ? Volume1 : Volume2;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center" aria-hidden="true">
      <div className="flex min-w-56 animate-[hud-in_160ms_var(--ease-out-soft)] items-center gap-3 rounded-full bg-black/60 px-5 py-3 backdrop-blur-md">
        <Glyph className="h-6 w-6 shrink-0" />
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-brand transition-[width] duration-100" style={{ width: `${level}%` }} />
        </div>
        <span className="w-12 text-right text-small font-bold tabular-nums">{muted ? "Muted" : `${level}%`}</span>
      </div>
    </div>
  );
}
