/* Member Library Service (watchlist, progress, ratings) */
// Kept per member in localStorage until the API's library module exists.
import { mockApi } from "@/store/tanstackStore/services/api/mock";
import type { Id, RequestOptions } from "@/store/tanstackStore/services/api/types";
import type { EpisodeProgress, ProgressEntry, Rating } from "./types";

type MemberId = Id | null | undefined;
type ProgressMap = Record<Id, ProgressEntry>;
type EpisodeMap = Record<Id, EpisodeProgress>;
type RatingMap = Record<Id, Rating>;

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
  mockApi(() => read<Id[]>(key(memberId, "list"), []), 0, signal);

export const toggleWatchlist = (memberId: MemberId, titleId: Id) =>
  mockApi(() => {
    const list = read<Id[]>(key(memberId, "list"), []);
    return write(key(memberId, "list"), list.includes(titleId) ? list.filter((x) => x !== titleId) : [titleId, ...list]);
  }, 0);

/**
 * Where a member stopped. One entry per title (the latest episode for a
 * series): { seconds, duration, updatedAt, episodeId? }. Per-episode bars
 * live in a second map, so an episode list can show every episode's progress.
 */
export const getProgress = (memberId: MemberId, { signal }: RequestOptions = {}) =>
  mockApi(() => read<ProgressMap>(key(memberId, "progress"), {}), 0, signal);
export const getEpisodeProgress = (memberId: MemberId, { signal }: RequestOptions = {}) =>
  mockApi(() => read<EpisodeMap>(key(memberId, "episodes"), {}), 0, signal);

export const saveProgress = (memberId: MemberId, titleId: Id, seconds: number, duration: number, episodeId: Id | null = null) =>
  mockApi(() => {
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
  mockApi(() => {
    const all = read<ProgressMap>(key(memberId, "progress"), {});
    delete all[titleId];
    return write(key(memberId, "progress"), all);
  }, 0);

/** Ratings: "meh" (Not for me), "like" (I like this), "love" (Love this!). */
export const getRatings = (memberId: MemberId, { signal }: RequestOptions = {}) =>
  mockApi(() => read<RatingMap>(key(memberId, "ratings"), {}), 0, signal);

export const setRating = (memberId: MemberId, titleId: Id, rating: Rating | null) =>
  mockApi(() => {
    const all = read<RatingMap>(key(memberId, "ratings"), {});
    if (!rating || all[titleId] === rating) delete all[titleId];
    else all[titleId] = rating;
    return write(key(memberId, "ratings"), all);
  }, 0);

/** Reels this member has watched (ids, newest first), for the line under a card. */
export const getWatchedReels = (memberId: MemberId, { signal }: RequestOptions = {}) =>
  mockApi(() => read<Id[]>(key(memberId, "reels-watched"), []), 0, signal);

export const markReelWatched = (memberId: MemberId, reelId: Id) =>
  mockApi(() => {
    const seen = read<Id[]>(key(memberId, "reels-watched"), []);
    return write(key(memberId, "reels-watched"), [reelId, ...seen.filter((x) => x !== reelId)].slice(0, 500));
  }, 0);
