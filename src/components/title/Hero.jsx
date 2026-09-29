/* Hero */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Info, Play, Plus, RotateCcw, Volume2, VolumeX } from "lucide-react";

import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { useWatchlist } from "@/store/tanstackStore/queries/member";
import { cn } from "@/utils/cn";
import MetaLine from "./MetaLine";
import TrailerBackdrop from "./TrailerBackdrop";

const ROTATE_MS = 9000;

/**
 * Full-bleed featured titles (order set in the Studio). Slow Ken Burns push
 * and film grain. A swap is a focus pull: the new film sharpens out of a blur
 * while the old one drifts away, a light sweeps across, and the copy follows
 * in step (title wiping up first). A glass pill holds the picker and the
 * trailer's sound button. Pauses on hover or focus; a plain cut under
 * reduced motion.
 */
export default function Hero({ titles }) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState(null); // the slide on its way out
  const [sound, setSound] = useState(null); // the trailer's sound control, once it plays
  const [paused, setPaused] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const onTrailer = useCallback((playing) => setTrailer(playing), []);
  const { has, toggle } = useWatchlist();
  const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const current = titles[index];
  // Swipe left or right to change title (touch and pen); vertical drags still
  // scroll the page (touch-action: pan-y on the section).
  const swipe = useRef(null);
  const show = useCallback((next) => {
    setIndex((i) => {
      if (next === i) return i;
      setPrev(i);
      return next;
    });
  }, []);
  const step = (dir) => show((index + dir + titles.length) % titles.length);
  const onSwipeStart = (e) => {
    if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onSwipeEnd = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || titles.length < 2) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  };

  useEffect(() => {
    if (paused || trailer || still || titles.length < 2) return undefined;
    const t = setTimeout(() => show((index + 1) % titles.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [index, paused, trailer, still, titles.length, show]);

  if (!current) return <div className="skeleton h-[min(92svh,56rem)] w-full" />;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={onSwipeStart}
      onPointerUp={onSwipeEnd}
      onPointerCancel={() => { swipe.current = null; }}
      className="film-grain relative isolate flex min-h-[min(92svh,56rem)] touch-pan-y items-end overflow-hidden"
    >
      {/* Backdrops: the showing one pulls into focus over the one leaving;
          the rest wait unseen, already loaded, for their turn. */}
      {titles.map((t, i) => {
        const role = i === index ? "in" : i === prev ? "out" : "idle";
        return (
          <div
            key={t.id}
            aria-hidden={i !== index}
            onAnimationEnd={role === "out" ? () => setPrev(null) : undefined}
            className={cn(
              "absolute inset-0 overflow-hidden",
              role === "in" && "hero-in -z-10",
              role === "out" && "hero-out pointer-events-none -z-20",
              role === "idle" && "pointer-events-none -z-30 opacity-0",
            )}
          >
            {role === "in" ? (
              <TrailerBackdrop key={t.id} title={t} onPlayingChange={onTrailer} onSound={setSound} imageClassName="animate-kenburns" />
            ) : (
              <img src={t.backdrop || t.poster} alt="" fetchPriority="low" className="h-full w-full object-cover" />
            )}
          </div>
        );
      })}
      {/* A soft light passes across the frame on each swap */}
      {prev !== null && <span key={`sweep-${index}`} className="hero-sweep pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-transparent via-white/12 to-transparent" aria-hidden="true" />}
      {/* Shading only: never takes a click (it sits over the trailer's sound button) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-black via-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-surface-primary via-surface-primary/20 to-black/40" />

      {/* Content: taps pass through its empty space to the trailer's sound
          control underneath; only its own links and buttons take them. */}
      <div className="shell pointer-events-none pb-[clamp(5rem,10vw,8rem)] pt-40 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <div key={current.id} className="hero-copy max-w-2xl">
          <p className="eyebrow mb-4" style={{ "--i": 0 }}>Featured</p>
          <h1 className="hero-title text-display text-balance" style={{ "--i": 1 }}>{current.title}</h1>
          <MetaLine title={current} className="mt-5" style={{ "--i": 2 }} />
          <p className="mt-5 line-clamp-3 max-w-xl text-lead text-text-secondary" style={{ "--i": 3 }}>{current.synopsis}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3" style={{ "--i": 4 }}>
            <Button variant="light" to={`/watch/${current.id}`}>
              <Play className="h-5 w-5 fill-current" aria-hidden="true" /> Play
            </Button>
            <Button variant="glass" to={`/title/${current.id}`}>
              <Info className="h-5 w-5" aria-hidden="true" /> More info
            </Button>
            <IconButton label={has(current.id) ? "Remove from My List" : "Add to My List"} pressed={has(current.id)} onClick={() => toggle(current.id)}>
              {has(current.id) ? <Check className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
            </IconButton>
          </div>
        </div>
      </div>

      {/* Phones: which title this is, and a way to pick one (swiping works too) */}
      {titles.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center md:hidden">
          {titles.map((t, i) => (
            <button key={t.id} type="button" onClick={() => show(i)} aria-label={`Show ${t.title}`} aria-current={i === index} className="grid h-11 w-7 place-items-center">
              <span className={cn("block h-1.5 rounded-full transition-all", i === index ? "w-5 bg-text-primary" : "w-1.5 bg-white/40")} />
            </button>
          ))}
        </div>
      )}

      {/* Phones: the sound button bottom-right, level with the dots */}
      <SoundButton sound={sound} className="absolute bottom-6 right-4 md:hidden" />

      {/* Picker and sound in one glass pill: each segment fills while its
          title is up; the speaker controls that title's trailer. */}
      {(titles.length > 1 || sound?.ready) && (
        <div data-glass="" className="molten-glass absolute bottom-[clamp(5rem,10vw,8rem)] right-[clamp(1rem,4vw,3.5rem)] hidden items-center gap-2 rounded-full p-2.5 md:flex">
          {titles.length > 1 && titles.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => show(i)}
              aria-label={`Show ${t.title}`}
              aria-current={i === index}
              className="relative grid h-11 w-11 cursor-pointer place-items-center"
            >
              <span className="relative block h-1 w-full overflow-hidden rounded-full bg-white/25">
                <span
                  key={`${t.id}-${index}-${paused}-${trailer}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-text-primary"
                  style={{
                    width: i < index ? "100%" : i === index ? undefined : "0%",
                    animation: i === index && !paused && !trailer && !still ? `hero-fill ${ROTATE_MS}ms linear forwards` : undefined,
                    ...(i === index && (paused || trailer || still) ? { width: "100%" } : {}),
                  }}
                />
              </span>
            </button>
          ))}
          {titles.length > 1 && sound?.ready && <span className="mx-1 h-6 w-px bg-white/20" aria-hidden="true" />}
          <SoundButton sound={sound} bare />
        </div>
      )}
    </section>
  );
}

/**
 * The trailer's sound: speaker on, speaker crossed out, or replay once it has
 * ended. Required while trailers play with sound by default (a visitor must
 * be able to stop audio that starts by itself).
 */
function SoundButton({ sound, bare = false, className }) {
  if (!sound?.ready) return null;
  const { muted, done, toggle, replay } = sound;
  const label = done ? "Replay trailer" : muted ? "Turn sound on" : "Mute trailer";
  const Icon = done ? RotateCcw : muted ? VolumeX : Volume2;
  const button = (
    <button
      type="button"
      onClick={() => (done ? replay() : toggle(muted))}
      aria-label={label}
      title={label}
      aria-pressed={done ? undefined : !muted}
      data-sound-toggle=""
      className={cn(
        "relative grid h-11 w-11 cursor-pointer place-items-center rounded-full text-text-primary transition-colors hover:bg-white/15",
        muted && !done && "text-brand",
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {/* Sound on: three small bars dance under the speaker */}
      {!muted && !done && (
        <span className="absolute bottom-1.5 flex h-1.5 items-end gap-0.5" aria-hidden="true">
          {[0, 1, 2].map((b) => (
            <span key={b} className="w-0.5 animate-[eq_900ms_ease-in-out_infinite] rounded-full bg-brand" style={{ animationDelay: `${b * 150}ms` }} />
          ))}
        </span>
      )}
    </button>
  );
  if (bare) return button;
  return <div data-glass="" className={cn("molten-glass rounded-full p-0.5", className)}>{button}</div>;
}
