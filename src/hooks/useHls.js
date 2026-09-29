import { useEffect, useRef, useState } from "react";

/**
 * Attaches an HLS source to a <video> and exposes its quality levels.
 *
 * hls.js is preferred wherever the browser has Media Source Extensions:
 * it fetches segments with CORS (so a CDN's headers are honoured, and the
 * browser never opaquely blocks them, which is what native HLS in recent
 * Chrome did with ERR_BLOCKED_BY_ORB) and it lets us offer quality levels.
 * Native playback is the fallback for iPhone, which has no MSE, and picks
 * its own quality. hls.js loads on demand, so it only ships on first play.
 */
// `maxHeight`: data saver; Auto never picks a rendition taller than this.
export function useHls(videoRef, src, enabled = true, maxHeight = 0) {
  const hlsRef = useRef(null);
  const [error, setError] = useState(null);
  const [levels, setLevels] = useState([]); // [{ index, height, bitrate }]
  const [level, setLevelState] = useState(-1); // -1 = Auto
  const [playingHeight, setPlayingHeight] = useState(0); // what Auto chose

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || !enabled) return undefined;
    let cancelled = false;
    setError(null);

    import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return;
      if (Hls.isSupported()) {
        const hls = new Hls({ capLevelToPlayerSize: true, startLevel: -1, maxBufferLength: 30 });
        hlsRef.current = hls;
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          if (maxHeight) {
            // Highest rendition within the cap (levels are in the manifest's order).
            const within = data.levels.map((l, i) => ({ i, h: l.height })).filter((l) => l.h && l.h <= maxHeight).sort((a, b) => b.h - a.h)[0];
            if (within) hls.autoLevelCapping = within.i;
          }
          setLevels(data.levels.map((l, index) => ({ index, height: l.height, bitrate: l.bitrate })).sort((a, b) => b.height - a.height));
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => setPlayingHeight(hls.levels[data.level]?.height ?? 0));
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return;
          // One recovery attempt for a network blip before giving up.
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else setError("The stream stopped. Check your connection and try again.");
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        setError("This browser can't play the stream.");
      }
    });

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
      setLevels([]);
      setLevelState(-1);
    };
  }, [videoRef, src, enabled, maxHeight]);

  const setLevel = (index) => {
    if (hlsRef.current) hlsRef.current.currentLevel = index;
    setLevelState(index);
  };

  return { error, levels, level, playingHeight, setLevel };
}
