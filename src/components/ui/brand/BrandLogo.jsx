/* Brand Logo */
import { useEffect, useState } from "react";

import { cn } from "@/utils/cn";
import { LOGO_PATHS as P } from "./brandLogoPaths";

// Long enough for the whole intro, including the closing 360 spin.
const INTRO_MS = 2800;

/**
 * The Orbit A logo, drawn inline so it can move. On load the orbit draws
 * itself, the A rises, the play button pops and the orbit turns a full 360;
 * hovering turns it again. Under reduced motion it is simply there.
 * Styles live in index.css (Brand Logo). Artwork: docs/brand/README.md.
 */
export default function BrandLogo({ intro = false, label = "The Artistry360", className }) {
  const [playing, setPlaying] = useState(intro);

  useEffect(() => {
    if (!intro) return undefined;
    const t = setTimeout(() => setPlaying(false), INTRO_MS);
    return () => clearTimeout(t);
  }, [intro]);

  return (
    <svg
      viewBox={`0 0 ${P.width} ${P.height}`}
      width={P.width}
      height={P.height}
      className={cn("brand-logo", className)}
      data-intro={playing || undefined}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {/* Mark */}
      <svg width="300" height="300" viewBox="0 0 512 512" overflow="visible">
        <g className="brand-logo-orbit">
          <path className="brand-logo-ring" pathLength="1" d={P.ring} />
          <circle className="brand-logo-dot" cx={P.dot.cx} cy={P.dot.cy} r={P.dot.r} />
        </g>
        <path className="brand-logo-a" d={P.a} />
        <path className="brand-logo-play" d={P.play} />
      </svg>

      {/* Wordmark */}
      <g transform={`translate(0 ${P.shift})`}>
        <path className="brand-logo-the" d={P.the} />
        <path className="brand-logo-artistry" d={P.artistry} />
        <path className="brand-logo-num" d={P.num} />
      </g>
    </svg>
  );
}
