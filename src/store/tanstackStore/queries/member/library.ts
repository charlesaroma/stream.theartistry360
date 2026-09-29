/* Member Library Queries */
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Id } from "../../services/api/types";
import * as library from "../../services/libraryApi";
import type { Member, Rating } from "../../services/types";
import { useMember } from "@/store/context/MemberContext";
import { memberRoot } from "../keys";

type MemberId = Id | null | undefined;

// MemberContext is JSX (untyped); the member it holds is a Member or null.
const useMemberId = (): MemberId => (useMember() as { member: Member | null }).member?.id;

export const libraryQueries = {
  watchlist: (memberId: MemberId) =>
    queryOptions({
      queryKey: [...memberRoot(memberId), "watchlist"] as const,
      queryFn: ({ signal }) => library.getWatchlist(memberId, { signal }),
    }),
  progress: (memberId: MemberId) =>
    queryOptions({
      queryKey: [...memberRoot(memberId), "progress"] as const,
      queryFn: ({ signal }) => library.getProgress(memberId, { signal }),
    }),
  episodes: (memberId: MemberId) =>
    queryOptions({
      queryKey: [...memberRoot(memberId), "episode-progress"] as const,
      queryFn: ({ signal }) => library.getEpisodeProgress(memberId, { signal }),
    }),
  ratings: (memberId: MemberId) =>
    queryOptions({
      queryKey: [...memberRoot(memberId), "ratings"] as const,
      queryFn: ({ signal }) => library.getRatings(memberId, { signal }),
    }),
};

/**
 * My List. The toggle is optimistic: the tick, the card and My List change at
 * once, and roll back if the save fails.
 */
export function useWatchlist() {
  const memberId = useMemberId();
  const qc = useQueryClient();
  const options = libraryQueries.watchlist(memberId);
  const { data: list = [] } = useQuery(options);
  const toggle = useMutation({
    mutationFn: (titleId: Id) => library.toggleWatchlist(memberId, titleId),
    onMutate: async (titleId) => {
      await qc.cancelQueries({ queryKey: options.queryKey });
      const previous = qc.getQueryData(options.queryKey);
      qc.setQueryData(options.queryKey, (old = []) => (old.includes(titleId) ? old.filter((x) => x !== titleId) : [titleId, ...old]));
      return { previous };
    },
    onError: (_error, _titleId, context) => qc.setQueryData(options.queryKey, context?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: options.queryKey }),
  });
  return { list, has: (id: Id) => list.includes(id), toggle: toggle.mutate };
}

/**
 * Where the member stopped. Saves from the player run one after another per
 * title (mutation scope), so a late save can never overwrite a newer one.
 */
export function useProgress() {
  const memberId = useMemberId();
  const qc = useQueryClient();
  const progressOptions = libraryQueries.progress(memberId);
  const episodesOptions = libraryQueries.episodes(memberId);
  const { data: progress = {} } = useQuery(progressOptions);
  const { data: episodes = {} } = useQuery(episodesOptions);
  const save = useMutation({
    mutationFn: ({ titleId, seconds, duration, episodeId }: { titleId: Id; seconds: number; duration: number; episodeId?: Id | null }) =>
      library.saveProgress(memberId, titleId, seconds, duration, episodeId ?? null),
    scope: { id: `progress:${memberId ?? "guest"}` },
    onSuccess: (next) => qc.setQueryData(progressOptions.queryKey, next),
    meta: { invalidates: [episodesOptions.queryKey] },
  });
  const clear = useMutation({
    mutationFn: (titleId: Id) => library.clearProgress(memberId, titleId),
    onSuccess: (next) => qc.setQueryData(progressOptions.queryKey, next),
  });
  return { progress, episodes, save: save.mutate, clear: clear.mutate };
}

/** This member's rating per title; choosing the same rating again clears it. Optimistic. */
export function useRatings() {
  const memberId = useMemberId();
  const qc = useQueryClient();
  const options = libraryQueries.ratings(memberId);
  const { data: ratings = {} } = useQuery(options);
  const rate = useMutation({
    mutationFn: ({ titleId, rating }: { titleId: Id; rating: Rating | null }) => library.setRating(memberId, titleId, rating),
    onMutate: async ({ titleId, rating }) => {
      await qc.cancelQueries({ queryKey: options.queryKey });
      const previous = qc.getQueryData(options.queryKey);
      qc.setQueryData(options.queryKey, (old = {}) => {
        const next = { ...old };
        if (!rating || next[titleId] === rating) delete next[titleId];
        else next[titleId] = rating;
        return next;
      });
      return { previous };
    },
    onError: (_error, _vars, context) => qc.setQueryData(options.queryKey, context?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: options.queryKey }),
  });
  return { ratings, rate: (titleId: Id, rating: Rating | null) => rate.mutate({ titleId, rating }) };
}
