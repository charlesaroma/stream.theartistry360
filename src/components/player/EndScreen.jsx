/* End Screen */
import { RotateCcw } from "lucide-react";

import RateButtons from "@/components/title/RateButtons";
import UpNext from "./UpNext";

/** When a title ends: rate it, replay it, or roll into the next one. */
export default function EndScreen({ title, next, onReplay, onNext, onDismissNext, showNext, autoNext = true }) {
  return (
    <div className="absolute inset-0 z-20 grid animate-fade place-items-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="text-center">
        <p className="eyebrow mb-3">You watched</p>
        <h2 className="text-title">How was {title.title}?</h2>
        <RateButtons titleId={title.id} size="lg" showLabels className="mt-8 flex-wrap justify-center" />
        <button type="button" onClick={onReplay} className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-small font-semibold text-text-secondary hover:text-text-primary">
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Watch again
        </button>
      </div>
      {next && showNext && <UpNext next={next} auto={autoNext} onPlay={onNext} onCancel={onDismissNext} />}
    </div>
  );
}
