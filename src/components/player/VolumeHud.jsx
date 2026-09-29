/* Volume Hud */
import { Volume1, Volume2, VolumeX } from "lucide-react";

/**
 * The level readout near the top of the picture while the volume changes
 * (slider, arrow keys, M). Top, not centre: the centre is the big
 * play/pause button's on touch screens, and it would cover the readout. Unlike CenterFlash it holds still while you keep
 * adjusting, then fades a moment after the last change. The slider itself
 * announces the value to assistive tech, so this is visual only.
 */
export default function VolumeHud({ hud }) {
  if (!hud) return null;
  const { volume, muted } = hud;
  const level = muted ? 0 : Math.round(volume * 100);
  const Glyph = level === 0 ? VolumeX : level < 50 ? Volume1 : Volume2;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[12%] z-40 flex justify-center px-4" aria-hidden="true">
      <div className="flex w-full max-w-60 animate-[hud-in_160ms_var(--ease-out-soft)] items-center gap-3 rounded-full bg-black/60 px-4 py-2.5 backdrop-blur-md sm:max-w-64 sm:px-5 sm:py-3">
        <Glyph className="h-6 w-6 shrink-0" />
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-brand transition-[width] duration-100" style={{ width: `${level}%` }} />
        </div>
        <span className="w-12 text-right text-small font-bold tabular-nums">{muted ? "Muted" : `${level}%`}</span>
      </div>
    </div>
  );
}
