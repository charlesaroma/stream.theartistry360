/* Pre-roll Ad */
import { useEffect, useState } from "react";

const LENGTH = 8;
const SKIPPABLE_AFTER = 5;

/**
 * Free-tier pre-roll. A stand-in for the Google IMA ad the player will request
 * with the tag set in the Studio (Streaming › Ads).
 */
export default function PrerollAd({ onDone }) {
  const [left, setLeft] = useState(LENGTH);

  useEffect(() => {
    if (left <= 0) {
      onDone();
      return undefined;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const skippable = LENGTH - left >= SKIPPABLE_AFTER;

  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,var(--color-brand-900),black_70%)]">
      <div className="text-center">
        <p className="eyebrow mb-3">Advertisement</p>
        <p className="text-title">Your ad here</p>
        <p className="mt-2 text-small text-text-secondary">Free members watch with short ads. Subscribers never see them.</p>
      </div>
      <div className="absolute bottom-8 left-8 rounded-full bg-black/60 px-4 py-2 text-caption font-bold tabular-nums" aria-live="polite">Ad · {left}s</div>
      <button
        type="button"
        onClick={onDone}
        disabled={!skippable}
        className="btn btn-glass molten-glass ember absolute bottom-6 right-6 disabled:opacity-60"
        data-glass=""
      >
        {skippable ? "Skip ad" : `Skip in ${SKIPPABLE_AFTER - (LENGTH - left)}`}
      </button>
    </div>
  );
}
