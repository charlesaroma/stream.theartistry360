/* Player Controls */
import { Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";

import { formatDuration } from "@/utils/format";

const ctl = "grid h-12 w-12 cursor-pointer place-items-center rounded-full text-text-primary transition-colors hover:bg-white/10";

export default function Controls({ state, actions }) {
  const { playing, time, duration, muted, fullscreen, buffered } = state;
  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Seek */}
      <div className="group/seek relative flex h-6 items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/20 transition-[height] group-hover/seek:h-1.5">
          <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${buffered}%` }} />
          <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1}
          value={time}
          onChange={(e) => actions.seek(Number(e.target.value))}
          aria-label="Seek"
          aria-valuetext={`${formatDuration(time)} of ${formatDuration(duration)}`}
          className="relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:opacity-0 group-hover/seek:[&::-webkit-slider-thumb]:opacity-100"
        />
      </div>

      <div className="flex items-center gap-1">
        <button type="button" className={ctl} onClick={actions.toggle} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="h-6 w-6 fill-current" aria-hidden="true" /> : <Play className="h-6 w-6 fill-current" aria-hidden="true" />}
        </button>
        <button type="button" className={ctl} onClick={() => actions.skip(-10)} aria-label="Back 10 seconds"><RotateCcw className="h-5 w-5" aria-hidden="true" /></button>
        <button type="button" className={ctl} onClick={() => actions.skip(10)} aria-label="Forward 10 seconds"><RotateCw className="h-5 w-5" aria-hidden="true" /></button>
        <button type="button" className={ctl} onClick={actions.mute} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX className="h-5 w-5" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
        </button>
        <span className="ml-2 text-small tabular-nums text-text-secondary">{formatDuration(time) === "—" ? "0:00" : formatDuration(time)} / {formatDuration(duration)}</span>
        <button type="button" className={`${ctl} ml-auto`} onClick={actions.fullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen"}>
          {fullscreen ? <Minimize className="h-5 w-5" aria-hidden="true" /> : <Maximize className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
