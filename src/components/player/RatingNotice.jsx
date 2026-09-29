/* Rating Notice */
import { useEffect, useState } from "react";

import { advisoryLine, ratingOf } from "@/utils/ageRatings";

const SHOW_MS = 7000;

/**
 * When a title starts playing: its rating and content warnings in the top
 * corner for a few seconds, the way broadcasters do, then it fades away.
 */
export default function RatingNotice({ title, playing }) {
  const [phase, setPhase] = useState("wait"); // wait -> show -> done, once
  const r = ratingOf(title.ageRating);

  useEffect(() => {
    if (phase === "done" || (phase === "wait" && !playing)) return undefined;
    const t = setTimeout(() => setPhase(phase === "wait" ? "show" : "done"), phase === "wait" ? 0 : SHOW_MS);
    return () => clearTimeout(t);
  }, [phase, playing]);

  if (!r || phase === "wait") return null;
  const done = phase === "done";
  const warnings = advisoryLine(title.advisories);
  return (
    <div aria-hidden={done} className={`pointer-events-none absolute left-4 top-4 z-20 flex items-stretch gap-3 transition-opacity duration-700 md:left-8 md:top-8 ${done ? "opacity-0" : "animate-fade opacity-100"}`}>
      <span className="w-1 rounded-full bg-brand" />
      <div className="drop-shadow-[0_2px_8px_rgb(0_0_0/0.8)]">
        <p className="text-lead font-bold">Rated {r.label}</p>
        <p className="text-small text-text-secondary">{warnings || r.meaning}</p>
      </div>
    </div>
  );
}
