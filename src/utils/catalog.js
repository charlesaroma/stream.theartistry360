/* Catalogue Browsing */

/**
 * The Films tabs. Each covers one or more video types (the Studio's Types &
 * Categories); "Classes" covers class replays and masterclasses together.
 * A type the Studio adds later shows under All until it gets a tab.
 */
export const FILM_TABS = [
  { id: "", label: "All", types: null },
  { id: "films", label: "Films", types: ["film"] },
  { id: "series", label: "Series", types: ["series"] },
  { id: "shorts", label: "Shorts", types: ["short"] },
  { id: "classes", label: "Classes", types: ["class"] },
  { id: "documentaries", label: "Documentaries", types: ["documentary"] },
  { id: "bts", label: "Behind the Scenes", types: ["bts"] },
];

export const tabOf = (id) => FILM_TABS.find((t) => t.id === id) ?? FILM_TABS[0];
export const inTab = (tab) => (title) => !tab.types || tab.types.includes(title.type);

export const ACCESS_OPTIONS = [
  { id: "free", label: "Free" },
  { id: "subscription", label: "Subscribers" },
  { id: "ppv", label: "Pay-per-view" },
];

export const SORTS = [
  { id: "new", label: "Newest", sort: (a, b) => new Date(b.releaseAt) - new Date(a.releaseAt) },
  { id: "popular", label: "Most watched", sort: (a, b) => (b.views ?? 0) - (a.views ?? 0) },
  { id: "az", label: "A–Z", sort: (a, b) => a.title.localeCompare(b.title) },
];

/**
 * Genres that make sense for a tab: the categories its titles actually use,
 * so Films offers Drama, Comedy and Thriller, and Classes offers Masterclass
 * and Screen Acting. Nothing is hard-coded; the Studio's categories decide.
 */
export function genresFor(titles, categories) {
  const used = new Set(titles.flatMap((t) => t.categoryIds ?? []));
  return categories.filter((c) => used.has(c.id));
}

/** Title, synopsis, cast and crew, case-insensitive. */
export function matchesQuery(title, q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [title.title, title.synopsis, ...(title.cast ?? []).map((c) => c.name), ...(title.crew ?? []).map((c) => c.name)]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}


/** The tab's lead story: the Studio's featured pick, else the most watched. */
export function featuredIn(titles) {
  return titles.find((t) => t.featured) ?? [...titles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0] ?? null;
}
