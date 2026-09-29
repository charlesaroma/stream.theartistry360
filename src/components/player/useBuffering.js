import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Whether to show the buffering indicator. A seek inside what is already
 * loaded still reports "waiting" for ~100ms, which made the spinner flash on
 * every skip; it now appears only if the wait lasts longer than `delay`.
 * Wire `wait` to loadstart/waiting and `done` to playing/canplay.
 */
export function useBuffering(delay = 350) {
  const [buffering, setBuffering] = useState(false);
  const timer = useRef(0);
  const wait = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBuffering(true), delay);
  }, [delay]);
  const done = useCallback(() => {
    clearTimeout(timer.current);
    setBuffering(false);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { buffering, wait, done };
}
