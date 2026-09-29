/* Featured Film */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Clapperboard, Info, Play } from "lucide-react";

import MetaLine from "@/components/title/MetaLine";
import TrailerBackdrop from "@/components/title/TrailerBackdrop";

/**
 * The tab's lead story: one wide banner with the backdrop, the title, a line
 * of synopsis, and Play or Trailer. Uses the Studio's featured setting.
 */
export default function FeaturedFilm({ title, eyebrow }) {
  const [trailer, setTrailer] = useState(false);
  const hasTrailer = title.trailer?.status === "ready";

  return (
    <section aria-labelledby="featured-film" className="shell pb-10">
      <div className="relative isolate flex min-h-[clamp(18rem,36vw,28rem)] items-end overflow-hidden rounded-3xl border border-white/8">
        {trailer ? (
          <TrailerBackdrop title={title} startAfter={0} controlsClassName="right-5 top-5" />
        ) : (
          <img src={title.backdrop || title.poster} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/90 via-black/55 to-transparent" />
        <div className="flex max-w-2xl flex-col gap-3 p-[clamp(1.25rem,4vw,3rem)]">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="featured-film" className="text-title text-balance">{title.title}</h2>
          <MetaLine title={title} />
          <p className="line-clamp-2 text-body text-text-secondary">{title.synopsis}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              to={`/watch/${title.id}`}
              viewTransition
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-text-primary px-5 text-small font-bold text-black hover:bg-white"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Play
            </Link>
            {hasTrailer && !trailer && (
              <button type="button" onClick={() => setTrailer(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-small font-semibold text-text-primary backdrop-blur-md hover:border-white/50">
                <Clapperboard className="h-4 w-4" aria-hidden="true" />
                Trailer
              </button>
            )}
            <Link to={`/title/${title.id}`} viewTransition className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-small font-semibold text-text-secondary hover:text-text-primary">
              <Info className="h-4 w-4" aria-hidden="true" />
              More info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
