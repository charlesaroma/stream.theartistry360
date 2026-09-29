/* Reel Slide */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clapperboard, Heart, Pause, Play, RotateCcw, RotateCw, Share2, Volume2, VolumeX, X } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import { useHls } from "@/hooks/useHls";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/format";
import CenterFlash from "./CenterFlash";

const SEEK = 10; // seconds, the same as J/L in the main player
const glass = "molten-glass grid h-12 w-12 place-items-center rounded-full transition-transform active:scale-90";

/**
 * One reel in the feed. Only the reel in view (`active`) mounts a <video>;
 * the rest show their poster, so scrolling a long feed never loads more than
 * one stream. The reel plays its scene (clip.start to clip.end) of the
 * linked title's stream on a loop, and "Scene from …" opens the full title
 * at clip.start.
 */
export default function ReelSlide({ reel, index, total, active, muted, onToggleMute, liked, onToggleLike, film, onClose }) {
  const videoRef = useRef(null);
  const flashTimer = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [flash, setFlash] = useState(null);
  const [copied, setCopied] = useState(false);
  const { error } = useHls(videoRef, reel.playbackUrl, active);
  const { start, end } = reel.clip;
  const length = end - start;

  const pulse = (kind) => {
    setFlash({ kind, id: Date.now() });
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 650);
  };
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); pulse("play"); } else { v.pause(); pulse("pause"); }
  };
  // Seeking stays inside the scene; the full title is one tap away for more.
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

  const share = async () => {
    const url = `${window.location.origin}/reels?reel=${reel.id}`;
    const data = { title: `${reel.title} — Artistry360 Reels`, text: reel.caption, url };
    if (navigator.share && navigator.canShare?.(data)) {
      try { await navigator.share(data); return; } catch { /* dismissed: fall back to copying */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing else to offer.
    }
  };

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
            v.play().catch(() => {});
          }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            // Loop the scene, not the whole title.
            if (v.currentTime >= end || v.currentTime < start - 1) v.currentTime = start;
            setElapsed(Math.max(0, v.currentTime - start));
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="h-full w-full cursor-pointer object-cover"
        />
      ) : (
        <img src={reel.poster} alt="" loading="lazy" className="h-full w-full object-cover" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/85" />
      <CenterFlash flash={flash} />
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
          disabled={!active}
          aria-label="Seek within the scene"
          aria-valuetext={`${formatDuration(elapsed)} of ${formatDuration(length)}`}
          className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
        />
      </div>

      {/* Top: play and seek on the left, where you are and close on the right */}
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
          <span className="px-2 text-caption font-semibold tabular-nums text-text-secondary">
            {formatDuration(elapsed) === "—" ? "0:00" : formatDuration(elapsed)} / {formatDuration(length)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-caption font-medium text-text-secondary backdrop-blur-xs">
            {index + 1} / {total}
          </span>
          <IconButton label="Close reels" onClick={onClose} className="h-10 w-10">
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      {/* Right Action Rail */}
      <div className="absolute bottom-24 right-3 z-30 flex flex-col items-center gap-4 text-center">
        <RailButton label={liked ? "Unlike reel" : "Like reel"} caption={reel.likes + (liked ? 1 : 0)} onClick={onToggleLike}>
          <span className={cn(glass, liked ? "text-brand shadow-[0_0_16px_color-mix(in_oklab,var(--color-brand)_60%,transparent)]" : "text-text-primary hover:text-brand")}>
            <Heart className={cn("h-6 w-6", liked && "fill-current")} aria-hidden="true" />
          </span>
        </RailButton>
        <RailButton label={muted ? "Unmute (M)" : "Mute (M)"} caption={muted ? "Muted" : "Sound"} onClick={onToggleMute}>
          <span className={cn(glass, "text-text-primary hover:text-brand")}>
            {muted ? <VolumeX className="h-6 w-6 text-text-muted" aria-hidden="true" /> : <Volume2 className="h-6 w-6 text-brand" aria-hidden="true" />}
          </span>
        </RailButton>
        <RailButton label="Share reel" caption={copied ? "Copied" : "Share"} onClick={share}>
          <span className={cn(glass, "text-text-primary hover:text-brand")}>
            {copied ? <Check className="h-6 w-6 text-success" aria-hidden="true" /> : <Share2 className="h-6 w-6" aria-hidden="true" />}
          </span>
        </RailButton>
        {film && (
          <Link to={film.titleTo} viewTransition onClick={onClose} aria-label={`About ${film.name}`} className="flex flex-col items-center gap-1">
            <span className={cn(glass, "border border-brand/50 text-brand")}>
              <Clapperboard className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-caption font-semibold text-brand drop-shadow-md">Title</span>
          </Link>
        )}
      </div>

      {/* Bottom: who, what, and the jump into the full title */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2.5 p-4 pr-18">
        {reel.talent && (
          <div className="flex items-center gap-2.5">
            {reel.talent.avatar && <img src={reel.talent.avatar} alt="" className="h-8 w-8 rounded-full border border-white/20 object-cover" />}
            <div>
              <p className="text-small font-bold leading-tight text-text-primary">{reel.talent.name}</p>
              <p className="text-caption leading-tight text-text-muted">{reel.talent.role}</p>
            </div>
          </div>
        )}
        <div>
          <h2 className="text-subheading font-bold text-text-primary drop-shadow-sm">{reel.title}</h2>
          <p className="mt-1 line-clamp-3 text-small leading-snug text-text-secondary">{reel.caption}</p>
        </div>
        {film && (
          <Link
            to={film.sceneTo}
            viewTransition
            onClick={onClose}
            title={film.canWatch ? undefined : "Opens the title page, where you can sign in, subscribe or buy it"}
            className="inline-flex min-h-9 max-w-full items-center gap-2 self-start rounded-full bg-white/12 px-3 text-caption font-semibold text-text-primary backdrop-blur-md transition-colors hover:bg-brand hover:text-surface-primary"
          >
            <Clapperboard className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
            <span className="truncate">Scene from &ldquo;{film.name}&rdquo;</span>
            <span className="shrink-0 tabular-nums opacity-80">· {formatDuration(start)}</span>
          </Link>
        )}
      </div>
    </article>
  );
}

function RailButton({ label, caption, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="flex flex-col items-center gap-1">
      {children}
      <span className="text-caption font-semibold text-text-primary drop-shadow-md">{caption}</span>
    </button>
  );
}
