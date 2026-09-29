/* Reel Helpers */

/** Category names and dot colours (tokens only). The filter chips use the same names. */
export const REEL_CATEGORIES = [
  { id: "monologue", label: "Monologues", one: "Monologue", dot: "bg-brand" },
  { id: "highlight", label: "Scene Cuts", one: "Scene cut", dot: "bg-info" },
  { id: "bts", label: "Behind the Scenes", one: "Behind the scenes", dot: "bg-warning" },
  { id: "audition", label: "Audition Lab", one: "Audition", dot: "bg-success" },
  { id: "teaser", label: "Teasers", one: "Teaser", dot: "bg-danger" },
];

export const categoryOf = (id) => REEL_CATEGORIES.find((c) => c.id === id);

/** The tabs over the grid; each is a sort of the same reels. */
export const REEL_TABS = [
  { id: "trending", label: "Trending", sort: (a, b) => (b.views ?? 0) - (a.views ?? 0) },
  { id: "new", label: "New", sort: (a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0) },
  { id: "liked", label: "Most liked", sort: (a, b) => (b.likes ?? 0) - (a.likes ?? 0) },
];

/** 12400 -> "12k", 1820 -> "1.8k". */
export function formatCount(n = 0) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return String(n);
}

/**
 * Silent hover previews only where they are cheap and welcome: a mouse or
 * trackpad, no reduced motion, no data saver, and not a 2G/3G connection.
 */
export function canPreview() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const c = navigator.connection;
  if (c?.saveData) return false;
  if (c?.effectiveType && c.effectiveType !== "4g") return false;
  return true;
}

/** Phones open /reels straight into the feed. */
export const isPhone = () => typeof window !== "undefined" && window.matchMedia?.("(max-width: 767px)").matches;

/** The featured reel plays by itself only when motion and data allow it. */
export function canAutoplay() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const c = navigator.connection;
  return !(c?.saveData || (c?.effectiveType && c.effectiveType !== "4g"));
}

/** Where someone last was in the feed, so a phone reopens it there. */
const LAST = "a360s:reels:last";
export const lastReel = {
  get: () => {
    try { return sessionStorage.getItem(LAST); } catch { return null; }
  },
  set: (id) => {
    try { sessionStorage.setItem(LAST, id); } catch { /* storage off: start from the top */ }
  },
};
