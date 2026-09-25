import { useEffect, useState } from "react";

/**
 * Attaches an HLS source to a <video>. Safari plays HLS natively; everything
 * else loads hls.js on demand, so its ~150 KB only ships to people who press
 * play. The real API returns a signed, expiring URL per play (MOU 3D).
 */
export function useHls(videoRef, src, enabled = true) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || !enabled) return undefined;
    let hls;
    let cancelled = false;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          setError("This browser can't play the stream.");
          return;
        }
        hls = new Hls({ capLevelToPlayerSize: true, startLevel: -1 });
        hls.on(Hls.Events.ERROR, (_, data) => data.fatal && setError("The stream stopped. Check your connection and try again."));
        hls.loadSource(src);
        hls.attachMedia(video);
      });
    }
    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [videoRef, src, enabled]);

  return error;
}
