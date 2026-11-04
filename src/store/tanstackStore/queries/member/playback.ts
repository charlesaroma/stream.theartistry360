/* Playback Link Query */
import { useQuery } from "@tanstack/react-query";

import type { Id } from "../../services/api/types";
import { startPlayback } from "../../services/catalogApi";
import type { Member } from "../../services/types";
import { useMember } from "@/store/context/MemberContext";

interface Media {
  titleId: Id;
  episodeId?: Id | null;
  /** The demo stream (mocks only). */
  playbackUrl?: string;
}

/**
 * The link the player streams from: asked for when playback is about to
 * start, for this viewer, and never kept or refetched while it plays (a new
 * link would restart the stream). Its own key root, so live updates to the
 * member's library never touch it.
 */
export function usePlaybackLink(media: Media, enabled: boolean) {
  const memberId = (useMember() as { member: Member | null }).member?.id;
  const { data, error } = useQuery({
    queryKey: ["playback", memberId ?? "guest", media.titleId, media.episodeId ?? null, media.playbackUrl ?? null] as const,
    queryFn: ({ signal }) => startPlayback({ titleId: media.titleId, episodeId: media.episodeId ?? null, fallbackUrl: media.playbackUrl }, { signal }),
    enabled,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return { url: data?.url, error: error ? error.message : null };
}
