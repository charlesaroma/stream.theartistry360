import { useCallback, useRef } from "react";

const MAX_TILT = 7; // degrees

/**
 * Key light for poster cards: tilt toward the pointer and move the light
 * (--rx/--ry, --lx/--ly). Writes CSS variables only, so React never
 * re-renders on pointer move. Touch and reduced motion get the still card.
 */
export function useKeyLight() {
  const frame = useRef(0);

  const onPointerMove = useCallback((e) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const { clientX, clientY } = e;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(px - 0.5) * MAX_TILT * 2}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * MAX_TILT * 2}deg`);
      el.style.setProperty("--lx", `${px * 100}%`);
      el.style.setProperty("--ly", `${py * 100}%`);
    });
  }, []);

  const onPointerLeave = useCallback((e) => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return { onPointerMove, onPointerLeave };
}
