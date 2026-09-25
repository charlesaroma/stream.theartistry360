/* Watch */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import PageLoader from "@/components/ui/PageLoader";
import { useMember } from "@/context/MemberContext";
import { useTitle } from "@/hooks/useCatalog";
import { useProgress } from "@/hooks/useLibrary";
import { accessFor } from "@/utils/access";
import { cn } from "@/utils/cn";
import Controls from "./sections/Controls";
import PrerollAd from "./sections/PrerollAd";
import { useHls } from "./sections/useHls";

const HIDE_AFTER = 2600;

/** Full-screen player. Access is checked here and again by the API's signed URL. */
export default function WatchPage() {
  const { id } = useParams();
  const { member, loading } = useMember();
  const { data: title, isLoading } = useTitle(id);
  const { progress, save } = useProgress();
  const frame = useRef(null);
  const video = useRef(null);
  const idle = useRef(0);
  const lastSaved = useRef(0);
  const [adDone, setAdDone] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [state, setState] = useState({ playing: false, time: 0, duration: 0, muted: false, fullscreen: false, buffered: 0 });

  const access = title ? accessFor(title, member) : null;
  const showAd = access?.ads && !adDone;
  const error = useHls(video, title?.playbackUrl, Boolean(access?.ok) && !showAd);

  // Controls fade away while watching and come back on any movement.
  const wake = useCallback(() => {
    setChrome(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setChrome(false), HIDE_AFTER);
  }, []);

  const actions = {
    toggle: () => (video.current.paused ? video.current.play() : video.current.pause()),
    seek: (t) => { video.current.currentTime = t; },
    skip: (d) => { video.current.currentTime = Math.max(0, video.current.currentTime + d); },
    mute: () => { video.current.muted = !video.current.muted; setState((s) => ({ ...s, muted: video.current.muted })); },
    fullscreen: () => (document.fullscreenElement ? document.exitFullscreen() : frame.current?.requestFullscreen()),
  };

  useEffect(() => {
    const onFs = () => setState((s) => ({ ...s, fullscreen: Boolean(document.fullscreenElement) }));
    const onKey = (e) => {
      if (!video.current || e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") { e.preventDefault(); actions.toggle(); }
      if (k === "arrowright" || k === "l") actions.skip(10);
      if (k === "arrowleft" || k === "j") actions.skip(-10);
      if (k === "m") actions.mute();
      if (k === "f") actions.fullscreen();
      wake();
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("keydown", onKey);
      clearTimeout(idle.current);
    };
  });

  if (isLoading || loading) return <PageLoader />;
  if (!title || !access?.ok) return <Navigate to={`/title/${id}`} replace />;

  const resumeAt = progress[title.id]?.seconds ?? 0;

  return (
    <div
      ref={frame}
      onPointerMove={wake}
      className={cn("fixed inset-0 z-50 bg-black", !chrome && state.playing && "cursor-none")}
    >
      {showAd && <PrerollAd onDone={() => setAdDone(true)} />}

      <video
        ref={video}
        className="h-full w-full"
        playsInline
        autoPlay
        onClick={actions.toggle}
        onLoadedMetadata={(e) => {
          if (resumeAt > 5 && resumeAt < e.currentTarget.duration - 10) e.currentTarget.currentTime = resumeAt;
          setState((s) => ({ ...s, duration: e.currentTarget.duration }));
        }}
        onPlay={() => { setState((s) => ({ ...s, playing: true })); wake(); }}
        onPause={() => { setState((s) => ({ ...s, playing: false })); setChrome(true); }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          const buffered = v.buffered.length ? (v.buffered.end(v.buffered.length - 1) / (v.duration || 1)) * 100 : 0;
          setState((s) => ({ ...s, time: v.currentTime, buffered }));
          // Progress is saved every ~5 seconds, not every frame.
          if (Math.abs(v.currentTime - lastSaved.current) >= 5) {
            lastSaved.current = v.currentTime;
            save({ titleId: title.id, seconds: v.currentTime, duration: v.duration });
          }
        }}
      />

      {error && (
        <div role="alert" className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <p className="text-heading">{error}</p>
            <Link to={`/title/${title.id}`} className="btn btn-primary ember mt-6">Back to {title.title}</Link>
          </div>
        </div>
      )}

      {/* Chrome */}
      <div className={cn("pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-500", chrome || !state.playing ? "opacity-100" : "opacity-0")}>
        <div className="pointer-events-auto flex items-center gap-4 bg-linear-to-b from-black/80 to-transparent p-[clamp(1rem,3vw,2rem)]">
          <Link to={`/title/${title.id}`} viewTransition aria-label={`Back to ${title.title}`} className="grid h-12 w-12 place-items-center rounded-full hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          </Link>
          <div>
            <p className="text-caption uppercase tracking-[0.18em] text-text-muted">Now playing</p>
            <h1 className="text-subheading">{title.title}</h1>
          </div>
        </div>
        <div className="pointer-events-auto bg-linear-to-t from-black/85 to-transparent p-[clamp(1rem,3vw,2rem)]">
          <Controls state={state} actions={actions} />
        </div>
      </div>
    </div>
  );
}
