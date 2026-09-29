/* Reel Slide */
import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX, X } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import BrandMark from "@/components/ui/brand/BrandMark";
import { useHls } from "@/hooks/useHls";
import { formatDuration } from "@/utils/format";
import CenterFlash from "./CenterFlash";
import ReelInfo from "./ReelInfo";
import ReelRail from "./ReelRail";

const SEEK = 10; // seconds, the same as J/L in the main player
const WATCHED_AFTER = 5; // seconds of a scene before it counts as watched

/**
 * One reel in the feed. Only the reel in view (`active`) mounts a <video>;
 * the rest show their poster and are inert, so scrolling a long feed never
 * loads more than one stream. The reel plays its scene (clip.start to
 * clip.end) of the film's stream on a loop.
 */
export default function ReelSlide({
  reel, index, total, active, muted, onToggleMute, onSoundBlocked, liked, onToggleLike,
  film, inList, onToggleList, onWatched, onClose, onBrowseAll,
}) {
  const videoRef = useRef(null);
  const flashTimer = useRef(0);
  const counted = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [flash, setFlash] = useState(null);
  const { error } = useHls(videoRef, reel.playbackUrl, active);
  const { start, end } = reel.clip;
  const length = end - start;

  const pulse = (kind) => {
    setFlash({ kind, id: Date.now() });
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 650);
  };
  // Play with sound if allowed; a browser that refuses sound gets it muted.
  const play = (v) =>
    v.play().catch((err) => {
      if (err?.name !== "NotAllowedError" || v.muted) return;
      onSoundBlocked?.();
      v.muted = true;
      v.play().catch(() => {});
    });
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { play(v); pulse("play"); } else { v.pause(); pulse("pause"); }
  };
  // Seeking stays inside the scene; the full film is one tap away for more.
  const seekTo = (seconds) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = start + Math.min(Math.max(seconds, 0), length - 0.25);
    setElapsed(v.currentTime - start);
  };
  const skip = (delta) => {
    seekTo((videoRef.current?.currentTime ?? start) - start + delta);
    pulse(delta < 0 ? "back" : "forward");
  };

  // The muted attribute only applies on mount; keep the element in step.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted, active]);

  // Shortcuts belong to the reel in view: Space/K play, ←/J and →/L seek, M sound.
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && e.target.type !== "range") return;
      const k = e.key.toLowerCase();
      const run = { " ": toggle, k: toggle, arrowleft: () => skip(-SEEK), j: () => skip(-SEEK), arrowright: () => skip(SEEK), l: () => skip(SEEK), m: onToggleMute }[k];
      if (!run) return;
      e.preventDefault();
      run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  return (
    <article
      aria-label={`${reel.title}, reel ${index + 1} of ${total}`}
      // Only the reel in view takes focus and clicks; the others are scenery.
      inert={!active}
      className="relative h-full w-full overflow-hidden bg-black shadow-[0_24px_60px_rgb(0_0_0/0.8)] md:h-[92vh] md:w-auto md:aspect-9/16 md:rounded-3xl md:border md:border-white/10"
    >
      {/* Picture: the stream in view, a poster everywhere else */}
      {active ? (
        <video
          ref={videoRef}
          poster={reel.poster}
          playsInline
          crossOrigin="anonymous"
          onClick={toggle}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.currentTime = start;
            play(v);
          }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            // Loop the scene, not the whole film.
            if (v.currentTime >= end || v.currentTime < start - 1) v.currentTime = start;
            const at = Math.max(0, v.currentTime - start);
            setElapsed(at);
            if (!counted.current && at >= Math.min(WATCHED_AFTER, length / 2)) {
              counted.current = true;
              onWatched?.();
            }
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onLoadStart={() => setBuffering(true)}
          className="h-full w-full cursor-pointer object-cover"
        />
      ) : (
        <img src={reel.poster} alt="" loading="lazy" className="h-full w-full object-cover" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/55 via-transparent to-transparent" />
      <CenterFlash flash={flash} />
      {/* Buffering: the logo's orbit turns */}
      {active && buffering && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center" role="status" aria-label="Loading">
          <BrandMark motion="spin" className="brand-loader h-14 w-14 drop-shadow-[0_2px_12px_rgb(0_0_0/0.6)]" />
        </div>
      )}
      {active && error && (
        <p role="alert" className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-2xl bg-black/70 p-4 text-center text-small text-text-secondary">{error}</p>
      )}

      {/* Scrubber: the scene's own timeline; a range input keeps it keyboard-usable */}
      <div className="absolute inset-x-0 top-0 z-30 h-4">
        <div className="absolute inset-x-0 top-0 h-1 bg-white/20" aria-hidden="true">
          <div className="h-full bg-brand" style={{ width: `${(elapsed / length) * 100}%` }} />
        </div>
        <input
          type="range"
          min={0}
          max={length}
          step={0.5}
          value={elapsed}
          onChange={(e) => seekTo(Number(e.target.value))}
          aria-label="Seek within the scene"
          aria-valuetext={`${formatDuration(elapsed)} of ${formatDuration(length)}`}
          className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
        />
      </div>

      {/* Top: playback on the left, the exits on the right */}
      <div className="absolute inset-x-0 top-3 z-30 flex items-center justify-between gap-2 px-3">
        <div className="molten-glass flex items-center gap-0.5 rounded-full p-1">
          <IconButton label={playing ? "Pause (Space)" : "Play (Space)"} onClick={toggle} className="h-10 w-10">
            {playing ? <Pause className="h-5 w-5 fill-current" aria-hidden="true" /> : <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />}
          </IconButton>
          <IconButton label={`Back ${SEEK} seconds (←)`} onClick={() => skip(-SEEK)} className="h-10 w-10">
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
          </IconButton>
          <IconButton label={`Forward ${SEEK} seconds (→)`} onClick={() => skip(SEEK)} className="h-10 w-10">
            <RotateCw className="h-5 w-5" aria-hidden="true" />
          </IconButton>
          <IconButton label={muted ? "Unmute (M)" : "Mute (M)"} onClick={onToggleMute} pressed={!muted} className="h-10 w-10">
            {muted ? <VolumeX className="h-5 w-5 text-text-muted" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
          </IconButton>
          <span className="hidden px-2 text-caption font-semibold tabular-nums text-text-secondary sm:inline">
            {elapsed < 1 ? "0:00" : formatDuration(elapsed)} / {formatDuration(length)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onBrowseAll && (
            <IconButton label="Browse all reels" onClick={onBrowseAll} className="h-10 w-10 md:hidden">
              <LayoutGrid className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          )}
          <IconButton label="Close reels" onClick={onClose} className="h-10 w-10">
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <ReelRail reel={reel} liked={liked} onToggleLike={onToggleLike} film={film} inList={inList} onToggleList={onToggleList} />
      <ReelInfo reel={reel} film={film} />
    </article>
  );
}
