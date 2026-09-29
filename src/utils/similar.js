/* More Like This */
// Same type or a shared category, strongest overlap first, then most watched.
export function moreLikeThis(title, titles, limit = 12) {
  const cats = new Set(title.categoryIds ?? []);
  return titles
    .filter((t) => t.id !== title.id)
    .map((t) => ({
      t,
      score: (t.type === title.type ? 2 : 0) + (t.categoryIds ?? []).filter((c) => cats.has(c)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.t.views ?? 0) - (a.t.views ?? 0))
    .slice(0, limit)
    .map((x) => x.t);
}
