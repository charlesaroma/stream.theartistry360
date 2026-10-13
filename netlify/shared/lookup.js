/* Title Lookup */
// One title's public share data, for the share card (edge function) and its
// image (netlify/functions/title-card.mjs). The API
// when SHARE_API_BASE is set (GET streaming/titles/:id, public fields only),
// otherwise /share/catalog.json from the build (scripts/share-catalog.mjs).
import { cardVersion } from "../../src/seo/seo.js";

const TTL = 5 * 60 * 1000;
let cached = null; // { at, catalog }

export async function lookupTitle(origin, id) {
  const api = globalThis.Netlify?.env?.get?.("SHARE_API_BASE");
  if (api) {
    const res = await fetch(`${api.replace(/\/+$/, "")}/api/v1/streaming/titles/${encodeURIComponent(id)}`, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const { data: t } = await res.json();
    if (!t) return null;
    const entry = {
      title: t.title,
      description: t.synopsis ?? "",
      kind: [t.typeName, t.releaseYear].filter(Boolean).join(" · "),
      type: t.type,
      year: t.releaseYear,
      releaseAt: t.releaseAt,
      ageRating: t.ageRating,
      genres: t.categoryNames ?? [],
      poster: t.poster ?? null,
      backdrop: t.backdrop ?? null,
    };
    return { ...entry, version: t.updatedAt ? String(Date.parse(t.updatedAt)) : cardVersion(entry) };
  }
  if (!cached || Date.now() - cached.at > TTL) {
    const res = await fetch(new URL("/share/catalog.json", origin));
    cached = { at: Date.now(), catalog: res.ok ? await res.json() : { titles: {} } };
  }
  return cached.catalog.titles?.[id] ?? null;
}
