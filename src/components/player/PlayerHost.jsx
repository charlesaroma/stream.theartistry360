/* Player Host */
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { useMember } from "@/store/context/MemberContext";
import { usePlayback } from "@/store/context/playbackContext";
import { useTitles } from "@/store/tanstackStore/queries/site";
import { accessFor } from "@/utils/access";
import { epLabel, isSeries, mediaFor, nextEpisode } from "@/utils/episodes";
import { moreLikeThis } from "@/utils/similar";
import Player from "./Player";

/**
 * Mounted once in the site layout. It renders the player into the provider's
 * container, and provides the mini-player slot that container is parked in
 * when you leave the watch page.
 */
export default function PlayerHost() {
  const { session, mode, container, miniSlotRef } = usePlayback();
  const { member } = useMember();
  const { data: titles = [] } = useTitles();
  const navigate = useNavigate();
  if (!session) return null;

  const { title, episodeId, ads, startAt } = session;
  const media = mediaFor(title, episodeId);
  const go = (path) => navigate(path, { viewTransition: true });

  // Next: the following episode, else something similar you can watch.
  let next = null;
  let nextPath = null;
  const ep = isSeries(title) ? nextEpisode(title, media.episodeId) : null;
  if (ep) {
    next = { title: `${epLabel(ep)} · ${ep.title}`, backdrop: ep.still, isEpisode: true };
    nextPath = `/watch/${title.id}?ep=${ep.id}`;
  } else {
    const similar = moreLikeThis(title, titles).find((t) => accessFor(t, member).ok);
    if (similar) {
      next = similar;
      nextPath = `/watch/${similar.id}`;
    }
  }

  return (
    <>
      {createPortal(
        <Player
          // A new start time remounts the player so it seeks there.
          key={`${media.key}:${startAt ?? ""}`}
          media={media}
          title={title}
          ads={ads}
          startAt={startAt}
          next={next}
          onNext={() => nextPath && go(nextPath)}
          variant={mode}
          onExpand={() => go(`/watch/${title.id}${media.episodeId ? `?ep=${media.episodeId}` : ""}`)}
        />,
        container,
      )}
      {/* Mini slot: always mounted while a session exists, shown only when parked */}
      <div
        className={
          mode === "mini"
            ? "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 w-[min(22rem,calc(100vw-2rem))] animate-rise overflow-hidden rounded-2xl shadow-[0_20px_60px_rgb(0_0_0/0.7)] ring-1 ring-white/15"
            : "hidden"
        }
      >
        <div ref={miniSlotRef} className="aspect-video w-full bg-black" />
      </div>
    </>
  );
}
