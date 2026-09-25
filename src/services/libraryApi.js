/* Member Library Service (watchlist, progress) */
// Kept per member in localStorage until the API's library module exists.
import { mockApi } from "@/api/mock";

const key = (memberId, what) => `a360s:${what}:${memberId ?? "guest"}`;
const read = (k, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(k) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    // Storage full or blocked.
  }
  return v;
};

export const getWatchlist = (memberId) => mockApi(() => read(key(memberId, "list"), []), 0);

export const toggleWatchlist = (memberId, titleId) =>
  mockApi(() => {
    const list = read(key(memberId, "list"), []);
    return write(key(memberId, "list"), list.includes(titleId) ? list.filter((x) => x !== titleId) : [titleId, ...list]);
  }, 0);

/** { [titleId]: { seconds, duration, updatedAt } } */
export const getProgress = (memberId) => mockApi(() => read(key(memberId, "progress"), {}), 0);

export const saveProgress = (memberId, titleId, seconds, duration) =>
  mockApi(() => {
    const all = read(key(memberId, "progress"), {});
    // Near the end counts as finished and drops out of Continue Watching.
    if (duration && seconds / duration > 0.95) delete all[titleId];
    else all[titleId] = { seconds, duration, updatedAt: new Date().toISOString() };
    return write(key(memberId, "progress"), all);
  }, 0);
