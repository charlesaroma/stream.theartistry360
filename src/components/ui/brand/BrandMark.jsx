/* Brand Mark */
import { cn } from "@/utils/cn";
import { LOGO_PATHS as P } from "./brandLogoPaths";

/**
 * The Orbit A symbol on its own, for loaders and short intros. `motion`:
 * - "spin": the orbit turns while the A and play button hold still (waiting)
 * - "draw": the orbit draws in, the A rises, the play button pops (arriving)
 * - "press": "draw", then the play button presses (a film is about to start)
 * - "turn": one full 360 turn (a welcome)
 * Without `motion` it is still. Styles: index.css, Brand Mark.
 */
export default function BrandMark({ motion, label, className }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width="512"
      height="512"
      className={cn("brand-logo brand-mark", className)}
      data-motion={motion}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <g className="brand-logo-orbit">
        <path className="brand-logo-ring" pathLength="1" d={P.ring} />
        <circle className="brand-logo-dot" cx={P.dot.cx} cy={P.dot.cy} r={P.dot.r} />
      </g>
      <path className="brand-logo-a" d={P.a} />
      <path className="brand-logo-play" d={P.play} />
    </svg>
  );
}
