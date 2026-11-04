/* Member Library Service (watchlist, progress, ratings) */
// A signed-in member's are kept on their account (`library/*`), so they
// follow them to every device and the app. A guest's (and everyone's on
// mocks) stay in this browser's localStorage.
import { http } from "@/store/tanstackStore/services/api/client";
import { useMockApi } from "@/store/tanstackStore/services/api/config";
import { routes } from "@/store/tanstackStore/services/api/routes";
import { mockApi } from "@/store/tanstackStore/services/api/mock";
import type { Id, RequestOptions } from "@/store/tanstackStore/services/api/types";
import type { EpisodeProgress, ProgressEntry, Rating } from "./types";

type MemberId = Id | null | undefined;
type ProgressMap = Record<Id, ProgressEntry>;
type EpisodeMap = Record<Id, EpisodeProgress>;
type RatingMap = Record<Id, Rating>;

/** Whether this member's library is on the API. */
const onAccount = (memberId: MemberId): memberId is Id => !useMockApi && Boolean(memberId);

const key = (memberId: MemberId, what: string) => `a360s:${what}:${memberId ?? "guest"}`;
const read = <T>(k: string, fallback: T): T => {
  try {
    return (JSON.parse(localStorage.getItem(k) ?? "null") as T | null) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = <T>(k: string, v: T): T => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    // Storage full or blocked.
  }
  return v;
};

export const getWatchlist = (memberId: MemberId, { signal }: RequestOptions = {}) =>
  onAccount(memberId) ? http.get<Id[]>(routes.watchlist, { signal }) : mockApi(() => read<Id[]>(key(memberId, "list"), []), 0, signal);

/** Adds (`on`) or removes a title; answers with the list. */
export const toggleWatchlist = (memberId: MemberId, titleId: Id, on: boolean) =>
  onAccount(memberId)
    ? on ? http.put<Id[]>(`${routes.watchlist}/${titleId}`) : http.del<Id[]>(`${routes.watchlist}/${titleId}`)
    : mockApi(() => {
    const list = read<Id[]>(key(memberId, "list"), []);
    return write(key(memberId, "list"), list.includes(titleId) ? list.filter((x) => x !== titleId) : [titleId, ...list]);
  }, 0);

/**
 * Where a member stopped. One entry per title (the latest episode for a
 * series): { seconds, duration, updatedAt, episodeId? }. Per-episode bars
 * live in a second map, so an episode list can show every episode's progress.
 */
export const getProgress = (memberId: MemberId, { signal }: RequestOptions = {}) =>
  onAccount(memberId) ? http.get<ProgressMap>(routes.progress, { signal }) : mockApi(() => read<ProgressMap>(key(memberId, "progress"), {}), 0, signal);
export const getEpisodeProgress = (memberId: MemberId, { signal }: RequestOptions = {}) =>
  onAccount(memberId) ? http.get<EpisodeMap>(routes.episodeProgress, { signal }) : mockApi(() => read<EpisodeMap>(key(memberId, "episodes"), {}), 0, signal);

export const saveProgress = (memberId: MemberId, titleId: Id, seconds: number, duration: number, episodeId: Id | null = null) =>
  onAccount(memberId)
    ? http.put<ProgressMap>(routes.progress, { titleId, episodeId, seconds, duration })
    : mockApi(() => {
    const done = duration && seconds / duration > 0.95;
    const all = read<ProgressMap>(key(memberId, "progress"), {});
    if (episodeId) {
      const eps = read<EpisodeMap>(key(memberId, "episodes"), {});
      eps[episodeId] = { seconds: done ? 0 : seconds, duration, done: Boolean(done || eps[episodeId]?.done), updatedAt: new Date().toISOString() };
      write(key(memberId, "episodes"), eps);
    }
    // Finished: drops out of Continue Watching (a series moves on via "next episode").
    if (done) delete all[titleId];
    else all[titleId] = { seconds, duration, updatedAt: new Date().toISOString(), ...(episodeId ? { episodeId } : {}) };
    return write(key(memberId, "progress"), all);
  }, 0);

export const clearProgress = (memberId: MemberId, titleId: Id) =>
  onAccount(memberId)
    ? http.del<ProgressMap>(`${routes.progress}/${titleId}`)
    : mockApi(() => {
    const all = read<ProgressMap>(key(memberId, "progress"), {});
    delete all[titleId];
    return write(key(memberId, "progress"), all);
  }, 0);

/** Ratings: "meh" (Not for me), "like" (I like this), "love" (Love this!). */
export const getRatings = (memberId: MemberId, { signal }: RequestOptions = {}) =>
  onAccount(memberId) ? http.get<RatingMap>(routes.ratings, { signal }) : mockApi(() => read<RatingMap>(key(memberId, "ratings"), {}), 0, signal);

/** Sets a rating, or clears it with null. */
export const setRating = (memberId: MemberId, titleId: Id, rating: Rating | null) =>
  onAccount(memberId)
    ? rating ? http.put<RatingMap>(`${routes.ratings}/${titleId}`, { rating }) : http.del<RatingMap>(`${routes.ratings}/${titleId}`)
    : mockApi(() => {
    const all = read<RatingMap>(key(memberId, "ratings"), {});
    if (!rating || all[titleId] === rating) delete all[titleId];
    else all[titleId] = rating;
    return write(key(memberId, "ratings"), all);
  }, 0);

