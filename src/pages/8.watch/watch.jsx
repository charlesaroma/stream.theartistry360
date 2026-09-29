/* Watch */
import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { Check, Plus, Share2 } from "lucide-react";

import CommunityCard from "@/components/title/CommunityCard";
import MetaLine from "@/components/title/MetaLine";
import PosterCard from "@/components/title/PosterCard";
import RateButtons from "@/components/title/RateButtons";
import Row from "@/components/title/Row";
import BackButton from "@/components/ui/BackButton";
import IconButton from "@/components/ui/IconButton";
import PageLoader from "@/components/ui/PageLoader";
import { useMember } from "@/store/context/MemberContext";
import { usePlayback } from "@/store/context/playbackContext";
import { useTitle, useTitles } from "@/store/tanstackStore/queries/site";
import { useWatchlist } from "@/store/tanstackStore/queries/member";
import { accessFor } from "@/utils/access";
import { moreLikeThis } from "@/utils/similar";

/**
 * Watching happens in the page, not a takeover: the player sits under the
 * navbar with the details, community and "More like this" below it. Full
 * screen is one press away (button, F, or double-click).
 */
export default function WatchPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const episodeId = params.get("ep");
  const { member, loading } = useMember();
  const { data: title, isLoading } = useTitle(id);
  const { data: titles = [] } = useTitles();
  const { has, toggle } = useWatchlist();
  const { open, close, attach } = usePlayback();
  const [copied, setCopied] = useState(false);
  const access = title ? accessFor(title, member) : null;
  const canWatch = Boolean(access?.ok);

  // The player itself is rendered by PlayerHost in the layout; this page
  // starts the session and lends it a slot.
  useEffect(() => {
    if (canWatch) open(title, episodeId, access.ads);
  }, [canWatch, title, episodeId, access?.ads, open]);

  // Leaving stops playback. Switch to park() once Player has its mini variant.
  useEffect(() => close, [close]);

  if (isLoading || loading) return <PageLoader />;
  if (!title || !canWatch) return <Navigate to={`/title/${id}`} replace />;

  const similar = moreLikeThis(title, titles);

  const share = async () => {
    const url = `${window.location.origin}/title/${title.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: title.title, url }); } catch { /* dismissed */ }
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="pb-[clamp(3rem,6vw,6rem)] pt-18">
      {/* Player slot: PlayerHost portals the player in; a new title remounts it by key */}
      <div ref={attach} className="mx-auto w-full max-w-[1680px] md:px-[clamp(1rem,4vw,3.5rem)] md:pt-6" />

      <div className="shell mt-8 grid grid-cols-1 gap-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div>
          <BackButton className="mb-6" />
          <h1 className="text-title text-balance">{title.title}</h1>
          <MetaLine title={title} className="mt-3" />
          <p className="mt-4 max-w-3xl text-body text-text-secondary">{title.description || title.synopsis}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <RateButtons titleId={title.id} />
            <span className="mx-1 h-8 w-px bg-border-default" aria-hidden="true" />
            <IconButton label={has(title.id) ? "Remove from My List" : "Add to My List"} pressed={has(title.id)} onClick={() => toggle(title.id)}>
              {has(title.id) ? <Check className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
            </IconButton>
            <IconButton label={copied ? "Link copied" : "Share"} onClick={share}>
              {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Share2 className="h-5 w-5" aria-hidden="true" />}
            </IconButton>
          </div>
        </div>
        <div className="lg:self-start">
          <CommunityCard />
        </div>
      </div>

      <div className="mt-[clamp(2.5rem,5vw,4rem)]">
        <Row title="More like this" items={similar} render={(t) => <PosterCard title={t} />} />
      </div>
    </div>
  );
}
