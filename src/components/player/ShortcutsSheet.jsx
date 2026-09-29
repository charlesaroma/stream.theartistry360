/* Keyboard Shortcuts Sheet */
import { X } from "lucide-react";

const KEYS = [
  ["Space / K", "Play or pause"],
  ["J / ←", "Back 10 seconds"],
  ["L / →", "Forward 10 seconds"],
  ["↑ / ↓", "Volume"],
  ["M", "Mute"],
  ["C", "Subtitles on or off"],
  ["F", "Full screen"],
  ["P", "Picture in picture"],
  ["0–9", "Jump to 0–90%"],
  ["?", "This sheet"],
];

export default function ShortcutsSheet({ onClose }) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-label="Keyboard shortcuts" data-glass="" onClick={(e) => e.stopPropagation()} className="molten-glass relative w-full max-w-md animate-rise rounded-3xl bg-black/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-heading">Keyboard shortcuts</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full hover:bg-white/10"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-small">
          {KEYS.map(([k, d]) => (
            <div key={k} className="contents">
              <dt><kbd className="rounded-md border border-white/20 px-2 py-0.5 font-sans text-caption">{k}</kbd></dt>
              <dd className="text-text-secondary">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
