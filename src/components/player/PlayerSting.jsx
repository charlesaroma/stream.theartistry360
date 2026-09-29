/* Player Sting */
import { useEffect } from "react";

import BrandMark from "@/components/ui/brand/BrandMark";

const LENGTH = 1500;

/**
 * A short brand intro before a title's first play in a session: the orbit
 * draws in, the play button presses, and the film starts. When it runs is
 * decided in sting.js.
 */
export default function PlayerSting({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, LENGTH);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="player-sting absolute inset-0 z-30 grid place-items-center bg-black" aria-hidden="true">
      <BrandMark motion="press" className="h-24 w-24 md:h-32 md:w-32" />
    </div>
  );
}
