/* Playback Provider */
import { useCallback, useMemo, useRef, useState } from "react";

import { PlaybackContext } from "./playbackContext";

/**
 * Owns what is playing and where it is shown: the watch page ("page") or a
 * floating corner player ("mini") that keeps going while you browse.
 *
 * The player renders once, into a detached container element. The container
 * is moved between the page slot and the mini slot with appendChild. Moving
 * (rather than remounting) keeps the <video> playing: a media element is only
 * paused when it is left out of the document after the current task, and a
 * move puts it straight back.
 */
export default function PlaybackProvider({ children }) {
  const [session, setSession] = useState(null); // { title, episodeId, ads, startAt }
  const [mode, setMode] = useState("page");
  const [container] = useState(() => {
    const el = document.createElement("div");
    el.className = "h-full w-full";
    return el;
  });
  const miniSlotRef = useRef(null);

  // The same title and episode keeps playing; a start time (?t=) always
  // starts a fresh session there.
  const open = useCallback((title, episodeId, ads, startAt = null) => {
    setSession((prev) =>
      prev && prev.title.id === title.id && prev.episodeId === episodeId && prev.startAt === startAt
        ? prev
        : { title, episodeId, ads, startAt },
    );
  }, []);

  const close = useCallback(() => {
    container.remove();
    setSession(null);
    setMode("page");
  }, [container]);

  const attach = useCallback((slot) => {
    if (!slot) return;
    slot.appendChild(container);
    setMode("page");
  }, [container]);

  const park = useCallback(() => {
    miniSlotRef.current?.appendChild(container);
    setMode("mini");
  }, [container]);

  const value = useMemo(
    () => ({ session, mode, container, miniSlotRef, open, close, attach, park }),
    [session, mode, container, open, close, attach, park],
  );
  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}
