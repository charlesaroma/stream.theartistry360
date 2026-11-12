/* Title Lookup */
// One title's public share data, for the share card (edge function) and its
// image (netlify/functions/title-card.mjs). From the public API: SHARE_API_BASE,
// else production. SHARE_API_BASE=catalog reads /share/catalog.json (the demo seed,
// written by scripts/share-catalog.mjs) for local demos.
import { cardVersion, DEFAULT_API } from "../../src/seo/seo.js";

const TTL = 5 * 60 * 1000;
let cached = null; // { at, catalog }

const apiBase = () => {
  const set = globalThis.Netlify?.env?.get?.("SHARE_API_BASE");
  return set === "catalog" ? "" : String(set || DEFAULT_API).replace(/\/+$/, "");
};

/**
 * One title. `null` means the API says there is no such title (a 404); anything else going wrong (a 5xx, no
 * connection) throws, so the page is served as usual rather than wrongly turned into a 404.
 */
export async function lookupTitle(origin, id) {
  const api = apiBase();
  if (api) {
    const res = await fetch(`${api}/api/v1/streaming/titles/${encodeURIComponent(id)}`, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(5000) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`The API answered ${res.status}`);
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
