/* Watch Toolbar */
import { Check, Lightbulb, LightbulbOff, Maximize2, Minimize2, Plus, SkipBack, SkipForward } from "lucide-react";

import { setWatchPref, useWatchPrefs } from "@/hooks/useWatchPrefs";
import { cn } from "@/utils/cn";

const item =
  "inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-small font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

/** A choice that stays on: a check mark and brand colour while on. */
function Toggle({ on, onChange, children }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={cn(item, on ? "text-brand" : "text-text-muted hover:text-text-primary")}>
      <Check className={cn("h-4 w-4", !on && "opacity-30")} aria-hidden="true" />
      {children}
    </button>
  );
}

/**
 * The strip under the player: theatre (full width), auto next, auto skip
 * intro, lights, previous and next episode, and My List. Choices are kept in
 * this browser (useWatchPrefs).
 */
export default function WatchToolbar({ series, onPrev, onNext, lightsOff, onLights, inList, onList }) {
  const prefs = useWatchPrefs();
  return (
    <div role="toolbar" aria-label="Player options" className="flex items-center gap-1 overflow-x-auto border-b border-white/8 px-1 py-1 md:px-0">
      <button type="button" onClick={() => setWatchPref("theater", !prefs.theater)} aria-pressed={prefs.theater} className={cn(item, "hidden text-text-muted hover:text-text-primary lg:inline-flex")}>
        {prefs.theater ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
        {prefs.theater ? "Shrink" : "Expand"}
      </button>
      <Toggle on={prefs.autoNext} onChange={(v) => setWatchPref("autoNext", v)}>Auto next</Toggle>
      {series && <Toggle on={prefs.autoSkip} onChange={(v) => setWatchPref("autoSkip", v)}>Auto skip intro</Toggle>}
      <button type="button" onClick={onLights} aria-pressed={lightsOff} className={cn(item, lightsOff ? "text-brand" : "text-text-muted hover:text-text-primary")}>
        {lightsOff ? <LightbulbOff className="h-4 w-4" aria-hidden="true" /> : <Lightbulb className="h-4 w-4" aria-hidden="true" />}
        Lights
      </button>
      {series && (
        <>
          <button type="button" onClick={onPrev} disabled={!onPrev} className={cn(item, "text-text-muted hover:text-text-primary")}>
            <SkipBack className="h-4 w-4" aria-hidden="true" /> Prev
          </button>
          <button type="button" onClick={onNext} disabled={!onNext} className={cn(item, "text-text-muted hover:text-text-primary")}>
            Next <SkipForward className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      )}
      <button type="button" onClick={onList} aria-pressed={inList} className={cn(item, "ml-auto", inList ? "text-brand" : "text-text-muted hover:text-text-primary")}>
        {inList ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        {inList ? "In My List" : "My List"}
      </button>
    </div>
  );
}
