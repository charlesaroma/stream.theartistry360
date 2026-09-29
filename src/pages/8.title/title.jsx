/* Title Page */
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Check, Plus, Share2 } from "lucide-react";

import CommunityCard from "@/components/title/CommunityCard";
import AccessLabel from "@/components/title/AccessLabel";
import TrailerBackdrop from "@/components/title/TrailerBackdrop";
import MetaLine from "@/components/title/MetaLine";
import PosterCard from "@/components/title/PosterCard";
import RateButtons from "@/components/title/RateButtons";
import Row from "@/components/title/Row";
import BackButton from "@/components/ui/BackButton";
import IconButton from "@/components/ui/IconButton";
import PageLoader from "@/components/ui/PageLoader";
import { useTaxonomy, useTitle, useTitles } from "@/store/tanstackStore/queries/site";
import { useWatchlist } from "@/store/tanstackStore/queries/member";
import { moreLikeThis } from "@/utils/similar";
import Credits from "./sections/Credits";
import PrimaryAction from "./sections/PrimaryAction";

export default function TitlePage() {
  const { id } = useParams();
  const { data: title, isLoading, error } = useTitle(id);
  const { data: titles = [] } = useTitles();
  const { categoryName } = useTaxonomy();
  const { has, toggle } = useWatchlist();
  const [copied, setCopied] = useState(false);

  if (isLoading) return <PageLoader />;
  if (error || !title) return <Navigate to="/films" replace />;

  const similar = moreLikeThis(title, titles);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: title.title, text: title.synopsis, url });
      } catch {
        // Dismissed.
      }
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article>
      {/* Stage */}
      <header className="film-grain relative isolate flex min-h-[min(80svh,48rem)] items-end overflow-hidden">
        <TrailerBackdrop title={title} imageClassName="animate-kenburns" controlsClassName="bottom-[clamp(3rem,6vw,5rem)] right-[clamp(1rem,4vw,3.5rem)]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black via-black/70 to-black/10" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-surface-primary via-surface-primary/30 to-black/50" />
        <div className="shell grid grid-cols-1 items-end gap-10 pb-[clamp(3rem,6vw,5rem)] pt-40 md:grid-cols-[minmax(0,13rem)_1fr] lg:grid-cols-[minmax(0,16rem)_1fr]">
          <img src={title.poster} alt="" className="hidden aspect-2/3 w-full rounded-3xl object-cover shadow-[0_30px_80px_rgb(0_0_0/0.7)] md:block" />
          <div className="max-w-3xl animate-rise">
            <BackButton className="mb-8" />
            <div className="mb-4 flex flex-wrap gap-2">
              <AccessLabel title={title} />
              {title.categoryIds?.map((c) => <span key={c} className="chip bg-white/10 text-text-secondary">{categoryName(c)}</span>)}
            </div>
            {/* Long titles step down a size so they never run to three lines */}
            <h1 className={title.title.length > 24 ? "text-title text-balance" : "text-display text-balance"}>{title.title}</h1>
            <MetaLine title={title} className="mt-5" />
            <p className="mt-5 max-w-2xl text-lead text-text-secondary">{title.synopsis}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryAction title={title} />
              <RateButtons titleId={title.id} />
              <IconButton label={has(title.id) ? "Remove from My List" : "Add to My List"} pressed={has(title.id)} onClick={() => toggle(title.id)}>
                {has(title.id) ? <Check className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
              </IconButton>
              <IconButton label={copied ? "Link copied" : "Share"} onClick={share}>
                {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Share2 className="h-5 w-5" aria-hidden="true" />}
              </IconButton>
            </div>
          </div>
        </div>
      </header>

      {/* Details */}
      <div className="shell grid grid-cols-1 gap-[clamp(2.5rem,5vw,4rem)] pb-[clamp(3rem,6vw,6rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="flex flex-col gap-[clamp(2.5rem,5vw,4rem)]">
          {title.description && (
            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-heading mb-4">The story</h2>
              <p className="max-w-3xl whitespace-pre-line text-body text-text-secondary">{title.description}</p>
            </section>
          )}
          <Credits cast={title.cast} crew={title.crew} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CommunityCard />
        </div>
      </div>

      <div className="pb-[clamp(3rem,6vw,6rem)]">
        <Row title="More like this" items={similar} render={(t) => <PosterCard title={t} />} />
      </div>
    </article>
  );
}
