/* Watch */
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, Share2 } from "lucide-react";

import CommunityCard from "@/components/title/CommunityCard";
import Comments from "@/components/title/Comments";
import EpisodeGrid from "@/components/title/EpisodeGrid";
import MetaLine from "@/components/title/MetaLine";
import RateButtons from "@/components/title/RateButtons";
import RelatedList from "@/components/title/RelatedList";
import WatchToolbar from "@/components/player/WatchToolbar";
import BackButton from "@/components/ui/BackButton";
import IconButton from "@/components/ui/IconButton";
import PageLoader from "@/components/ui/PageLoader";
import { useMember } from "@/store/context/MemberContext";
import { usePlayback } from "@/store/context/playbackContext";
import { useTitle, useTitles } from "@/store/tanstackStore/queries/site";
import { useWatchlist } from "@/store/tanstackStore/queries/member";
import { accessFor } from "@/utils/access";
import { flatEpisodes, isSeries, mediaFor } from "@/utils/episodes";
import { cn } from "@/utils/cn";
import { useWatchPrefs } from "@/hooks/useWatchPrefs";
import { moreLikeThis } from "@/utils/similar";
import { usePageMeta } from "@/hooks/usePageMeta";

/**
 * Watching happens in the page, not a takeover. On a desktop the player sits
 * in a main column with a toolbar under it (theatre, auto next, auto skip
 * intro, lights, prev/next, My List) and a sidebar beside it: the episode
 * grid for a series, then "More like this". Expand (theatre) gives the
 * player the full width and moves the sidebar below. Phones stack it all.
 * Full screen is one press away (button, F, or double-click).
 */
export default function WatchPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const episodeId = params.get("ep");
  // ?t=<seconds>: start there (a shared timestamp link).
  const startAt = Number(params.get("t")) > 0 ? Number(params.get("t")) : null;
  const { member, loading } = useMember();
  const { data: title, isLoading } = useTitle(id);
  usePageMeta({ title: title ? `Watching ${title.title}` : undefined, description: title?.synopsis });
  const { data: titles = [] } = useTitles();
  const { has, toggle } = useWatchlist();
  const { open, close, attach } = usePlayback();
  const [copied, setCopied] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const { theater } = useWatchPrefs();
  const navigate = useNavigate();
  const access = title ? accessFor(title, member) : null;
  const canWatch = Boolean(access?.ok);

  // The player itself is rendered by PlayerHost in the layout; this page
  // starts the session and lends it a slot.
  useEffect(() => {
    if (canWatch) open(title, episodeId, access.ads, startAt);
  }, [canWatch, title, episodeId, access?.ads, open, startAt]);

  // Leaving stops playback. Switch to park() once Player has its mini variant.
  useEffect(() => close, [close]);

  // Esc brings the lights back.
  useEffect(() => {
    if (!lightsOff) return undefined;
    const onKey = (e) => e.key === "Escape" && setLightsOff(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightsOff]);

  if (isLoading || loading) return <PageLoader />;
  if (!title) return <Navigate to="/" replace />;
  // Can't watch yet: the title page opens its gate (price, sign in, plans).
  if (!canWatch) return <Navigate to={`/title/${id}?play=1`} replace />;

  const similar = moreLikeThis(title, titles);
  const media = mediaFor(title, episodeId);
  const current = isSeries(title) && media.episodeId;
  const playing = current ? media.sub : null;
  const all = current ? flatEpisodes(title) : [];
  const at = all.findIndex((e) => e.id === media.episodeId);
  const goEp = (e) => e && (() => navigate(`/watch/${title.id}?ep=${e.id}`, { viewTransition: true }));

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
      {/* Lights off: everything but the player dims; a click or Esc undoes it */}
      {lightsOff && <button type="button" aria-label="Turn the lights back on" onClick={() => setLightsOff(false)} className="fixed inset-0 z-50 animate-fade cursor-default bg-black/92" />}

      <div className={cn("mx-auto grid w-full max-w-[1680px] gap-x-8 gap-y-8 md:px-[clamp(1rem,4vw,3.5rem)] md:pt-6", !theater && "lg:grid-cols-[minmax(0,1fr)_22rem]")}>
        <div className="min-w-0">
          <div className={cn(lightsOff && "relative z-[60]")}>
            {/* Player slot: PlayerHost portals the player in; it never moves in the tree, so Expand never restarts the video */}
            <div ref={attach} />
            <div className="mt-2 px-2 md:px-0">
              <WatchToolbar
                series={Boolean(current)}
                onPrev={goEp(all[at - 1])}
                onNext={goEp(all[at + 1])}
                lightsOff={lightsOff}
                onLights={() => setLightsOff((v) => !v)}
                inList={has(title.id)}
                onList={() => toggle(title.id)}
              />
            </div>
          </div>

          <div className="mt-6 px-[clamp(1rem,4vw,3.5rem)] md:px-0">
            <BackButton className="mb-6" />
            <h1 className="text-title text-balance">{title.title}</h1>
            {playing && <p className="mt-2 text-lead font-semibold text-text-secondary">{playing}</p>}
            <MetaLine title={title} className="mt-3" />
            <p className="mt-4 max-w-3xl text-body text-text-secondary">{title.description || title.synopsis}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <RateButtons titleId={title.id} />
              <span className="mx-1 h-8 w-px bg-border-default" aria-hidden="true" />
              <IconButton label={copied ? "Link copied" : "Share"} onClick={share}>
                {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Share2 className="h-5 w-5" aria-hidden="true" />}
              </IconButton>
            </div>
            <Comments titleId={title.id} className="mt-12" />
          </div>
        </div>

        <aside className={cn("flex min-w-0 flex-col gap-8 px-[clamp(1rem,4vw,3.5rem)] md:px-0", theater && "lg:grid lg:grid-cols-3 lg:items-start")} aria-label="Episodes and more">
          {current && <EpisodeGrid key={media.episodeId} title={title} currentId={media.episodeId} />}
          <RelatedList titles={similar} />
          <CommunityCard />
        </aside>
      </div>
    </div>
  );
}
