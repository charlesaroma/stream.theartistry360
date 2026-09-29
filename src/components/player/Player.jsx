/* Player */
import { useCallback, useEffect, useRef, useState } from "react";
import { Minimize, Pause, Play } from "lucide-react";

import BrandMark from "@/components/ui/brand/BrandMark";
import { useHls } from "@/hooks/useHls";
import { useProgress } from "@/store/tanstackStore/queries/member";
import { cn } from "@/utils/cn";
import CenterFlash from "./CenterFlash";
import VolumeHud from "./VolumeHud";
import Controls from "./Controls";
import { useBuffering } from "./useBuffering";
import EndScreen from "./EndScreen";
import PlayerSting from "./PlayerSting";
import PrerollAd from "./PrerollAd";
import SettingsMenu from "./SettingsMenu";
import ShortcutsSheet from "./ShortcutsSheet";
import { markStingSeen, stingDue } from "./sting";
import { usePlayer } from "./usePlayer";

const typing = (el) => el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

/**
 * Two modes:
 * - In the page: controls show while the pointer is over the picture; when
 *   playing and idle they fade, leaving a thin progress line on the edge.
 * - Full screen: after a short idle everything goes, cursor included, and
 *   any movement brings it back. Larger controls and a title bar.
 */

const TAP_WAIT = 260; // ms before a tap counts as single
const DOUBLE_TAP = 300; // ms between the taps of a double tap
export default function Player({ title, ads, next, onNext, startAt = null }) {
  const frame = useRef(null);
  const video = useRef(null);
  const lastSaved = useRef(0);
  // When a tap last revealed the controls; the same tap's click must not
  // then land on the centre button that appeared under the finger.
  const revealedAt = useRef(0);
  // Touch taps: one tap shows or hides the controls, two quick taps in the
  // same spot toggle full screen. The single tap waits TAP_WAIT to be sure.
  const taps = useRef({ at: 0, x: 0, y: 0, timer: 0 });
  const lastPointer = useRef("mouse");
  useEffect(() => () => clearTimeout(taps.current.timer), []);
  const [adDone, setAdDone] = useState(!ads);
  const [settings, setSettings] = useState(false);
  // Narrow or short players get the settings as a bottom sheet (see SettingsMenu).
  const [compactSettings, setCompactSettings] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const [ended, setEnded] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const { progress, save } = useProgress();
  const { buffering, wait, done } = useBuffering();
  const p = usePlayer(video, frame);
  // A requested start (a reel's scene) wins over where the member stopped.
  const resumeAt = startAt ?? progress[title.id]?.seconds ?? 0;
  // Brand sting before a first play (rules in sting.js); the stream starts after it.
  const [stingDone, setStingDone] = useState(() => !stingDue(title.id, { ads, resumeAt }));
  const endSting = useCallback(() => {
    markStingSeen(title.id);
    setStingDone(true);
  }, [title.id]);
  const ready = adDone && stingDone;
  const hls = useHls(video, title.playbackUrl, ready);
  const { state, actions } = p;
  const fs = state.fullscreen;
  const captions = title.captions ?? [];
  const visible = p.chrome || !state.playing || settings || ended;
  const pct = state.duration ? (state.time / state.duration) * 100 : 0;

  // Shortcuts, while this player is on screen.
  useEffect(() => {
    const onKey = (e) => {
      if (!ready || typing(e.target) || document.querySelector('[role="dialog"][aria-label="Search"]')) return;
      const k = e.key.toLowerCase();
      const v = video.current;
      const handled = {
        " ": actions.toggle, k: actions.toggle,
        j: () => actions.skip(-10), arrowleft: () => actions.skip(-10),
        l: () => actions.skip(10), arrowright: () => actions.skip(10),
        arrowup: () => actions.setVolume(Math.min(1, (v?.volume ?? 1) + 0.1)),
        arrowdown: () => actions.setVolume(Math.max(0, (v?.volume ?? 1) - 0.1)),
        m: actions.mute, f: actions.fullscreen, p: actions.pip,
        c: () => captions.length && actions.setCaptions(state.captions === -1 ? 0 : -1),
        "?": () => setShortcuts((s) => !s),
        escape: () => { setSettings(false); setShortcuts(false); },
      }[k] ?? (/^[0-9]$/.test(k) && v?.duration ? () => actions.seek((Number(k) / 10) * v.duration) : null);
      if (!handled) return;
      e.preventDefault();
      handled();
      p.wake();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const replay = () => {
    setEnded(false);
    actions.seek(0);
    video.current?.play();
  };

  return (
    <div
      ref={frame}
      // A moving mouse wakes the controls; touch uses taps (below) instead.
      onPointerMove={(e) => e.pointerType === "mouse" && p.wake()}
      // Only a mouse leaving hides the controls: touch sends pointerleave after
      // every tap, which used to hide them the moment they appeared.
      onPointerLeave={(e) => e.pointerType === "mouse" && state.playing && !settings && p.setChrome(false)}
      onPointerDown={(e) => { lastPointer.current = e.pointerType; }}
      // Mouse double-click toggles full screen; touch has its own detection below
      // (the browser's dblclick on touch is unreliable and zooms on iPhone).
      onDoubleClick={(e) => lastPointer.current === "mouse" && e.target === video.current && actions.fullscreen()}
      className={cn(
        "group/player relative isolate w-full touch-manipulation overflow-hidden bg-black",
        fs ? "h-full" : "aspect-video max-h-[calc(100dvh-7rem)] md:rounded-3xl",
        fs && !visible && "cursor-none",
      )}
    >
      {!adDone && <PrerollAd onDone={() => setAdDone(true)} />}
      {adDone && !stingDone && <PlayerSting onDone={endSting} />}

      <video
        ref={video}
        className="h-full w-full bg-black"
        playsInline
        autoPlay
        crossOrigin="anonymous"
        // Mouse: click plays or pauses. Touch: a tap shows the controls (or
        // hides them while playing), and a double tap toggles full screen.
        onPointerUp={(e) => {
          if (e.pointerType === "mouse") {
            actions.toggle();
            return;
          }
          const t = taps.current;
          const near = Math.hypot(e.clientX - t.x, e.clientY - t.y) < 48;
          clearTimeout(t.timer);
          if (e.timeStamp - t.at < DOUBLE_TAP && near) {
            t.at = 0;
            actions.fullscreen(); // still inside the tap, so the browser allows it
            return;
          }
          Object.assign(t, { at: e.timeStamp, x: e.clientX, y: e.clientY });
          const hide = visible && state.playing && !settings;
          t.timer = setTimeout(() => {
            if (hide) p.setChrome(false);
            else {
              revealedAt.current = performance.now();
              p.wake();
            }
          }, TAP_WAIT);
        }}
        onLoadedMetadata={(e) => {
          // Read the element now: React clears currentTarget before the updater runs.
          const v = e.currentTarget;
          const duration = Number.isFinite(v.duration) ? v.duration : 0;
          if ((startAt !== null || resumeAt > 5) && resumeAt < duration - 10) v.currentTime = resumeAt;
          [...v.textTracks].forEach((t) => { t.mode = "disabled"; });
          p.setState((s) => ({ ...s, duration }));
        }}
        onPlay={p.events.onPlay}
        onLoadStart={wait}
        onWaiting={wait}
        onPlaying={done}
        onCanPlay={done}
        onPause={p.events.onPause}
        onEnded={() => { setEnded(true); setShowNext(true); save({ titleId: title.id, seconds: state.duration, duration: state.duration }); }}
        onTimeUpdate={(e) => {
          p.events.onTimeUpdate(e);
          const v = e.currentTarget;
          if (Math.abs(v.currentTime - lastSaved.current) >= 5) {
            lastSaved.current = v.currentTime;
            save({ titleId: title.id, seconds: v.currentTime, duration: v.duration });
          }
        }}
      >
        {captions.map((c) => <track key={c.lang} kind="subtitles" src={c.src} srcLang={c.lang.slice(0, 2)} label={c.label} />)}
      </video>

      {/* Buffering: the orbit turns until frames arrive */}
      {ready && buffering && !ended && !hls.error && (
        <div role="status" aria-label="Loading video" className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <BrandMark motion="spin" className="brand-loader h-16 w-16 drop-shadow-[0_2px_12px_rgb(0_0_0/0.6)]" />
        </div>
      )}

      <CenterFlash flash={p.flash} />
      <VolumeHud hud={p.volumeHud} />

      {/* Touch: a big centre button, since a tap only reveals the controls.
          Above the controls' fade (z-30), which is tall on a small player. */}
      {visible && ready && !ended && !settings && (
        <button
          type="button"
          onClick={(e) => e.timeStamp - revealedAt.current > 500 && actions.toggle()}
          aria-label={state.playing ? "Pause" : "Play"}
          className="absolute left-1/2 top-1/2 z-30 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/50 backdrop-blur-md sm:h-20 sm:w-20 [@media(hover:hover)]:hidden"
        >
          {state.playing ? <Pause className="h-9 w-9 fill-current" aria-hidden="true" /> : <Play className="h-9 w-9 fill-current" aria-hidden="true" />}
        </button>
      )}

      {hls.error && (
        <div role="alert" className="absolute inset-0 z-20 grid place-items-center p-6 text-center text-heading">{hls.error}</div>
      )}

      {ended && (
        <EndScreen title={title} next={next} showNext={showNext} onReplay={replay} onNext={onNext} onDismissNext={() => setShowNext(false)} />
      )}

      {/* Full-screen title bar */}
      {fs && (
        <div className={cn("absolute inset-x-0 top-0 z-20 flex items-center gap-4 bg-linear-to-b from-black/80 to-transparent p-8 transition-opacity duration-500", visible ? "opacity-100" : "pointer-events-none opacity-0")}>
          <button type="button" onClick={actions.fullscreen} aria-label="Exit full screen" className="grid h-14 w-14 cursor-pointer place-items-center rounded-full hover:bg-white/15">
            <Minimize className="h-7 w-7" aria-hidden="true" />
          </button>
          <div>
            <p className="text-caption uppercase tracking-[0.18em] text-text-muted">Now playing</p>
            <p className="text-heading">{title.title}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      {ready && (
        <div
          // Touching or dragging the controls keeps them up.
          onPointerDown={p.wake}
          onInput={p.wake}
          // The fade itself never takes a tap (on a small player it covers most
          // of the picture); only the controls in it do, and only while shown.
          className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-500", fs ? "px-8 pb-8 pt-24" : "px-3 pb-2 pt-14 md:px-6 md:pb-3 md:pt-16", visible ? "opacity-100" : "opacity-0")}
        >
          <div className={visible ? "pointer-events-auto" : undefined}>
          <Controls state={state} actions={actions} large={fs} hasCaptions={captions.length > 0} settingsOpen={settings} onSettings={(e) => {
            // The dropdown opens upward from the gear. Use the bottom sheet when
            // it cannot fit there: a narrow player (phone portrait), a short one
            // (phone landscape), or a player scrolled up under the site header.
            const header = document.fullscreenElement ? 0 : (document.querySelector("header")?.getBoundingClientRect().bottom ?? 0);
            const roomAbove = e.currentTarget.getBoundingClientRect().top - header;
            setCompactSettings((frame.current?.offsetWidth ?? Infinity) < 448 || (frame.current?.offsetHeight ?? Infinity) < 360 || roomAbove < 220);
            setSettings((s) => !s);
          }}>
            {settings && (
              <SettingsMenu compact={compactSettings} hls={hls} captions={captions} state={state} actions={actions} onShortcuts={() => { setSettings(false); setShortcuts(true); }} onClose={() => setSettings(false)} />
            )}
          </Controls>
          </div>
        </div>
      )}

      {/* In-page, controls hidden: a thin progress line keeps your place */}
      {!fs && ready && (
        <div className={cn("absolute inset-x-0 bottom-0 z-10 h-[3px] bg-white/15 transition-opacity duration-500", visible ? "opacity-0" : "opacity-100")} aria-hidden="true">
          <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      )}

      {shortcuts && <ShortcutsSheet onClose={() => setShortcuts(false)} />}
    </div>
  );
}
