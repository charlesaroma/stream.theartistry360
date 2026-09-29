/* Player Settings Menu */
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Gauge, Keyboard, Subtitles, Tv } from "lucide-react";

import { cn } from "@/utils/cn";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function Row({ icon: Glyph, label, value, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-small hover:bg-white/10">
      <Glyph className="h-4 w-4 text-text-secondary" aria-hidden="true" />
      <span className="flex-1 text-left font-semibold">{label}</span>
      <span className="text-text-secondary">{value}</span>
      <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
    </button>
  );
}

function Choice({ selected, onClick, children }) {
  return (
    <button type="button" role="menuitemradio" aria-checked={selected} onClick={onClick} className={cn("flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-small hover:bg-white/10", selected && "text-brand-300")}>
      <Check className={cn("h-4 w-4", selected ? "opacity-100" : "opacity-0")} aria-hidden="true" />
      <span className="flex-1 text-left">{children}</span>
    </button>
  );
}

/**
 * Quality, subtitles, speed and the shortcut sheet, one level deep so every
 * setting is two presses away.
 */
export default function SettingsMenu({ hls, captions, state, actions, onShortcuts, onClose }) {
  const [panel, setPanel] = useState("main");
  const qualityLabel = hls.level === -1 ? `Auto${hls.playingHeight ? ` (${hls.playingHeight}p)` : ""}` : `${hls.levels.find((l) => l.index === hls.level)?.height}p`;
  const captionLabel = state.captions === -1 ? "Off" : captions[state.captions]?.label;

  const back = (title) => (
    <button type="button" onClick={() => setPanel("main")} className="mb-1 flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-small font-bold hover:bg-white/10">
      <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {title}
    </button>
  );

  return (
    <div role="menu" data-glass="" onKeyDown={(e) => e.key === "Escape" && onClose()} className="molten-glass absolute bottom-full right-0 z-30 mb-3 w-72 animate-rise rounded-2xl bg-black/70 p-2 text-text-primary">
      {panel === "main" && (
        <>
          <Row icon={Tv} label="Quality" value={qualityLabel} onClick={() => setPanel("quality")} />
          <Row icon={Subtitles} label="Subtitles" value={captionLabel} onClick={() => setPanel("captions")} />
          <Row icon={Gauge} label="Speed" value={state.rate === 1 ? "Normal" : `${state.rate}×`} onClick={() => setPanel("speed")} />
          <button type="button" onClick={onShortcuts} className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-small hover:bg-white/10">
            <Keyboard className="h-4 w-4 text-text-secondary" aria-hidden="true" />
            <span className="flex-1 text-left font-semibold">Keyboard shortcuts</span>
            <kbd className="text-caption text-text-muted">?</kbd>
          </button>
        </>
      )}
      {panel === "quality" && (
        <>
          {back("Quality")}
          <Choice selected={hls.level === -1} onClick={() => { hls.setLevel(-1); onClose(); }}>
            Auto <span className="text-text-muted">· best for your connection</span>
          </Choice>
          {hls.levels.map((l) => (
            <Choice key={l.index} selected={hls.level === l.index} onClick={() => { hls.setLevel(l.index); onClose(); }}>
              {l.height}p {l.height >= 720 && <span className="chip ml-1 bg-white/10 px-1.5 text-text-secondary">HD</span>}
            </Choice>
          ))}
          {!hls.levels.length && <p className="px-3 py-2 text-caption text-text-muted">Your browser picks the quality automatically.</p>}
        </>
      )}
      {panel === "captions" && (
        <>
          {back("Subtitles")}
          <Choice selected={state.captions === -1} onClick={() => { actions.setCaptions(-1); onClose(); }}>Off</Choice>
          {captions.map((c, i) => (
            <Choice key={c.lang} selected={state.captions === i} onClick={() => { actions.setCaptions(i); onClose(); }}>{c.label}</Choice>
          ))}
          {!captions.length && <p className="px-3 py-2 text-caption text-text-muted">No subtitles for this title yet.</p>}
        </>
      )}
      {panel === "speed" && (
        <>
          {back("Speed")}
          {SPEEDS.map((r) => (
            <Choice key={r} selected={state.rate === r} onClick={() => { actions.setRate(r); onClose(); }}>{r === 1 ? "Normal" : `${r}×`}</Choice>
          ))}
        </>
      )}
    </div>
  );
}
