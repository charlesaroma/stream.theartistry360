/* Player Controls */
import { Maximize, Minimize, Pause, PictureInPicture2, Play, RotateCcw, RotateCw, Settings, Subtitles, Volume1, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/format";

const clock = (s) => (formatDuration(s) === "—" ? "0:00" : formatDuration(s));

/** Seek bar and button row. `large` in full screen, where the screen is far away. */
export default function Controls({ state, actions, large, hasCaptions, settingsOpen, onSettings, children }) {
  const { playing, time, duration, muted, volume, fullscreen, buffered, captions } = state;
  const pct = duration ? (time / duration) * 100 : 0;
  const ctl = cn("grid cursor-pointer place-items-center rounded-full text-text-primary transition-colors hover:bg-white/15", large ? "h-14 w-14" : "h-11 w-11");
  const icon = large ? "h-7 w-7" : "h-5 w-5";
  const VolIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex flex-col gap-2">
      {/* Seek */}
      <div className="group/seek relative flex h-6 items-center">
        <div className={cn("absolute inset-x-0 rounded-full bg-white/20 transition-[height]", large ? "h-1.5 group-hover/seek:h-2" : "h-1 group-hover/seek:h-1.5")}>
          <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${buffered}%` }} />
          <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range" min={0} max={duration || 0} step={1} value={time}
          onChange={(e) => actions.seek(Number(e.target.value))}
          aria-label="Seek" aria-valuetext={`${clock(time)} of ${clock(duration)}`}
          className="relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:opacity-0 group-hover/seek:[&::-webkit-slider-thumb]:opacity-100"
        />
      </div>

      <div className="flex items-center gap-1">
        <button type="button" className={ctl} onClick={actions.toggle} aria-label={playing ? "Pause (K)" : "Play (K)"}>
          {playing ? <Pause className={cn(icon, "fill-current")} aria-hidden="true" /> : <Play className={cn(icon, "fill-current")} aria-hidden="true" />}
        </button>
        <button type="button" className={ctl} onClick={() => actions.skip(-10)} aria-label="Back 10 seconds (J)"><RotateCcw className={icon} aria-hidden="true" /></button>
        <button type="button" className={ctl} onClick={() => actions.skip(10)} aria-label="Forward 10 seconds (L)"><RotateCw className={icon} aria-hidden="true" /></button>

        {/* Volume: slider opens on hover or focus */}
        <div className="group/vol flex items-center">
          <button type="button" className={ctl} onClick={actions.mute} aria-label={muted ? "Unmute (M)" : "Mute (M)"}><VolIcon className={icon} aria-hidden="true" /></button>
          <input
            type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
            onChange={(e) => actions.setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="w-0 cursor-pointer accent-(--color-brand) opacity-0 transition-all duration-300 group-focus-within/vol:w-24 group-focus-within/vol:opacity-100 group-hover/vol:w-24 group-hover/vol:opacity-100"
          />
        </div>

        <span className={cn("ml-2 tabular-nums text-text-secondary", large ? "text-body" : "text-small")}>{clock(time)} / {clock(duration)}</span>

        <div className="relative ml-auto flex items-center gap-1">
          {hasCaptions && (
            <button type="button" className={cn(ctl, captions !== -1 && "text-brand")} onClick={() => actions.setCaptions(captions === -1 ? 0 : -1)} aria-label={captions === -1 ? "Subtitles on (C)" : "Subtitles off (C)"} aria-pressed={captions !== -1}>
              <Subtitles className={icon} aria-hidden="true" />
            </button>
          )}
          <button type="button" className={cn(ctl, settingsOpen && "bg-white/15")} onClick={onSettings} aria-label="Settings" aria-haspopup="menu" aria-expanded={settingsOpen}>
            <Settings className={cn(icon, "transition-transform duration-300", settingsOpen && "rotate-45")} aria-hidden="true" />
          </button>
          {"pictureInPictureEnabled" in document && (
            <button type="button" className={ctl} onClick={actions.pip} aria-label="Picture in picture (P)"><PictureInPicture2 className={icon} aria-hidden="true" /></button>
          )}
          <button type="button" className={ctl} onClick={actions.fullscreen} aria-label={fullscreen ? "Exit full screen (F)" : "Full screen (F)"}>
            {fullscreen ? <Minimize className={icon} aria-hidden="true" /> : <Maximize className={icon} aria-hidden="true" />}
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
