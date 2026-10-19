/* Home Row Resolution */
// Turns the Studio's row settings (`source`) into the titles to show.
import { FILM_TABS } from "./catalog";

const MAX_HOME_ROW_ITEMS = 12;

export function resolveRow(source, { titles, progress }) {
  if (source === "trending") return [...titles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 10);
  if (source === "new") return [...titles].sort((a, b) => new Date(b.releaseAt) - new Date(a.releaseAt)).slice(0, 12);
  if (source === "continue") return continueItems(titles, progress).slice(0, MAX_HOME_ROW_ITEMS).map((c) => c.title);
  const [kind, value] = source.split(":");
  if (kind === "tier") return titles.filter((t) => t.access?.tier === value).slice(0, MAX_HOME_ROW_ITEMS);
  if (kind === "type") return titles.filter((t) => t.type === value).slice(0, MAX_HOME_ROW_ITEMS);
  if (kind === "category") return titles.filter((t) => t.categoryIds?.includes(value)).slice(0, MAX_HOME_ROW_ITEMS);
  return [];
}

/** Where a row's "See all" leads on /films (tabs by type, genre by category). */
export function seeAllFor(source) {
  const [kind, value] = source.split(":");
  if (kind === "type") {
    const tab = FILM_TABS.find((t) => t.types?.includes(value));
    return tab ? `/films?tab=${tab.id}` : "/films";
  }
  if (kind === "category") return `/films?genre=${value}`;
  if (kind === "tier") return `/films?access=${value}`;
  if (source === "continue") return "/my-list";
  return "/films";
}

/** Unfinished titles, most recent first, each with where the member stopped. */
export function continueItems(titles, progress) {
  return Object.entries(progress)
    .sort(([, a], [, b]) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(([id, p]) => ({ title: titles.find((t) => t.id === id), progress: p }))
    .filter((c) => c.title && c.progress.duration - c.progress.seconds > 10);
}
