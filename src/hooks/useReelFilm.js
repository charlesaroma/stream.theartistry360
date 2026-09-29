/* Reel Film Hook */
import { useMember } from "@/store/context/MemberContext";
import { useTitles } from "@/store/tanstackStore/queries/site";
import { accessFor } from "@/utils/access";

/**
 * A reel's film as the catalogue names it, and where "Watch the film" leads:
 * into the film at the scene if this member may watch it, else to the film's
 * page (sign in, subscribe or buy). Returns a function, so a feed can look
 * up many reels with one catalogue read.
 */
export function useReelFilm() {
  const { member } = useMember();
  const { data: titles = [] } = useTitles();

  return (reel) => {
    if (!reel?.titleId) return null;
    const title = titles.find((t) => t.id === reel.titleId);
    const canWatch = Boolean(title && accessFor(title, member).ok);
    return {
      id: reel.titleId,
      name: title?.title ?? reel.titleName ?? "the full film",
      titleTo: `/title/${reel.titleId}`,
      watchTo: canWatch ? `/watch/${reel.titleId}?t=${reel.clip.start}` : `/title/${reel.titleId}`,
      canWatch,
    };
  };
}
