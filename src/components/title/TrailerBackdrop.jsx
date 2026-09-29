/* Trailer Backdrop */
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import { useSite } from "@/store/tanstackStore/queries/site";
import { useHls } from "@/hooks/useHls";
import { cn } from "@/utils/cn";

const START_AFTER = 1800;
const MAX_SECONDS = 60; // trailers are short; never let a long file run on

function allowedToAutoplay() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  if (navigator.connection?.saveData) return false;
  return true;
}

/**
 * The backdrop image, and after a moment the title's trailer playing muted
 * over it, Netflix-style. Controlled from the Studio: per title (trailer
 * uploaded, autoplay on) and site-wide (Stream Site › Hero).
 */
export default function TrailerBackdrop({ title, onPlayingChange, controlsClassName, imageClassName, startAfter = START_AFTER }) {
  const { data: site } = useSite();
  const box = useRef(null);
  const video = useRef(null);
  const [start, setStart] = useState(false);
  const [showing, setShowing] = useState(false);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(true);
  const eligible =
    title?.trailer?.status === "ready" &&
    title.trailer.autoplay !== false &&
    site?.hero?.autoplayTrailers !== false &&
    allowedToAutoplay();

  useHls(video, title?.trailer?.playbackUrl, start);

  useEffect(() => {
    if (!eligible || done) return undefined;
    const t = setTimeout(() => !document.hidden && setStart(true), startAfter);
    return () => clearTimeout(t);
  }, [eligible, done, startAfter]);

  // Pause off screen or in a hidden tab; resume when back.
  useEffect(() => {
    if (!start) return undefined;
    const v = video.current;
    const io = new IntersectionObserver(([entry]) => {
      if (!v || done) return;
      if (entry.intersectionRatio > 0.35 && !document.hidden) v.play().catch(() => {});
      else v.pause();
    }, { threshold: [0, 0.35] });
    if (box.current) io.observe(box.current);
    const onVis = () => (document.hidden ? v?.pause() : null);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [start, done]);

  useEffect(() => {
    onPlayingChange?.(showing);
  }, [showing, onPlayingChange]);

  const finish = () => {
    setShowing(false);
    setDone(true);
    video.current?.pause();
  };
  const replay = () => {
    setDone(false);
    if (video.current) {
      video.current.currentTime = 0;
      video.current.play().catch(() => {});
    }
  };

  return (
    <div ref={box} className="absolute inset-0 -z-10">
      <img src={title.backdrop || title.poster} alt="" className={cn("h-full w-full object-cover", imageClassName)} />
      {start && (
        <video
          ref={video}
          muted={muted}
          playsInline
          autoPlay
          crossOrigin="anonymous"
          aria-hidden="true"
          onPlaying={() => setShowing(true)}
          onEnded={finish}
          onTimeUpdate={(e) => e.currentTarget.currentTime > MAX_SECONDS && finish()}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-1000", showing ? "opacity-100" : "opacity-0")}
        />
      )}
      {start && (
        <div className={cn("absolute z-10 flex gap-2", controlsClassName ?? "bottom-[clamp(5rem,10vw,8rem)] right-[clamp(1rem,4vw,3.5rem)]")}>
          {done ? (
            <IconButton label="Replay trailer" onClick={replay} className="h-11 w-11">
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          ) : (
            <IconButton label={muted ? "Unmute trailer" : "Mute trailer"} pressed={!muted} onClick={() => setMuted((m) => !m)} className="h-11 w-11">
              {muted ? <VolumeX className="h-5 w-5" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
}
