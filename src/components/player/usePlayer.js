import { useCallback, useEffect, useRef, useState } from "react";

const HIDE_AFTER = 2600;
const HIDE_AFTER_TOUCH = 4500; // a thumb needs longer to find the timeline than a mouse
const hideAfter = () => (window.matchMedia?.("(pointer: coarse)").matches ? HIDE_AFTER_TOUCH : HIDE_AFTER);
const VOLUME_HUD_FOR = 900;

/**
 * Player state and actions in one place, so the controls, the settings menu
 * and the keyboard all drive the same <video>.
 */
export function usePlayer(videoRef, frameRef) {
  const idle = useRef(0);
  const flashTimer = useRef(0);
  const hudTimer = useRef(0);
  const [chrome, setChrome] = useState(true);
  const [flash, setFlash] = useState(null); // { kind: "play"|"pause"|"back"|"forward", id } | null
  const [volumeHud, setVolumeHud] = useState(null); // { volume, muted } | null
  const [state, setState] = useState({
    playing: false, time: 0, duration: 0, buffered: 0, muted: false, volume: 1, rate: 1, fullscreen: false, pip: false, captions: -1,
  });

  const wake = useCallback(() => {
    setChrome(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setChrome(false), hideAfter());
  }, []);

  const pulse = useCallback((kind) => {
    setFlash({ kind, id: Date.now() });
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 650);
  }, []);

  // Stays up while the level keeps changing; hides a moment after the last change.
  const showVolume = useCallback((volume, muted) => {
    setVolumeHud({ volume, muted });
    clearTimeout(hudTimer.current);
    hudTimer.current = setTimeout(() => setVolumeHud(null), VOLUME_HUD_FOR);
  }, []);

  const v = () => videoRef.current;
  const actions = {
    toggle: () => {
      if (!v()) return;
      if (v().paused) { v().play(); pulse("play"); } else { v().pause(); pulse("pause"); }
    },
    // The time and bar move at once; the picture follows when the seek lands.
    seek: (t) => {
      if (!v()) return;
      v().currentTime = t;
      setState((s) => ({ ...s, time: t }));
    },
    skip: (d) => {
      if (!v()) return;
      const t = Math.max(0, Math.min(v().duration || 0, v().currentTime + d));
      v().currentTime = t;
      setState((s) => ({ ...s, time: t }));
      pulse(d < 0 ? "back" : "forward");
    },
    setVolume: (vol) => {
      if (!v()) return;
      v().volume = vol;
      v().muted = vol === 0;
      setState((s) => ({ ...s, volume: vol, muted: vol === 0 }));
      showVolume(vol, vol === 0);
    },
    mute: () => {
      if (!v()) return;
      v().muted = !v().muted;
      const muted = v().muted;
      setState((s) => ({ ...s, muted }));
      showVolume(v().volume, muted);
    },
    setRate: (rate) => { if (!v()) return; v().playbackRate = rate; setState((s) => ({ ...s, rate })); },
    // Standard full screen where the browser has it (Android, desktop), with
    // the phone turned sideways; iPhone has no element full screen, only the
    // video's own native player, so fall back to that.
    fullscreen: () => {
      const doc = document;
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
        return;
      }
      const frame = frameRef.current;
      const video = v();
      const native = () => video?.webkitEnterFullscreen?.();
      // iPhone Safari defines the element methods but full screen is not
      // enabled there, and calling them does nothing (no error either), so
      // ask whether it is enabled rather than whether the method exists.
      const request = frame?.requestFullscreen ?? frame?.webkitRequestFullscreen;
      if (!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled) || !request) {
        native();
        return;
      }
      try {
        Promise.resolve(request.call(frame, { navigationUI: "hide" })).then(
          () => screen.orientation?.lock?.("landscape").catch(() => {}),
          native,
        );
      } catch {
        native();
      }
    },
    pip: async () => {
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await v()?.requestPictureInPicture();
      } catch {
        // Not supported, or blocked by the browser.
      }
    },
    setCaptions: (index) => {
      const tracks = v()?.textTracks;
      if (!tracks) return;
      [...tracks].forEach((t, i) => { t.mode = i === index ? "showing" : "disabled"; });
      setState((s) => ({ ...s, captions: index }));
    },
  };

  // Video element events feed state
  const events = {
    onPlay: () => { setState((s) => ({ ...s, playing: true })); wake(); },
    onPause: () => { setState((s) => ({ ...s, playing: false })); setChrome(true); },
    onTimeUpdate: (e) => {
      const el = e.currentTarget;
      const buffered = el.buffered.length ? (el.buffered.end(el.buffered.length - 1) / (el.duration || 1)) * 100 : 0;
      setState((s) => ({ ...s, time: el.currentTime, buffered }));
    },
  };

  // React has no props for the picture-in-picture events, so listen natively.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const enter = () => setState((s) => ({ ...s, pip: true }));
    const leave = () => setState((s) => ({ ...s, pip: false }));
    el.addEventListener("enterpictureinpicture", enter);
    el.addEventListener("leavepictureinpicture", leave);
    return () => {
      el.removeEventListener("enterpictureinpicture", enter);
      el.removeEventListener("leavepictureinpicture", leave);
    };
  }, [videoRef]);

  useEffect(() => {
    const onFs = () => {
      const on = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      if (!on) screen.orientation?.unlock?.();
      setState((s) => ({ ...s, fullscreen: on }));
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
      clearTimeout(idle.current);
      clearTimeout(flashTimer.current);
      clearTimeout(hudTimer.current);
    };
  }, []);

  return { state, setState, actions, events, chrome, setChrome, wake, flash, volumeHud };
}
