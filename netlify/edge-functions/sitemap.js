/* Sitemap (Netlify Edge Function) */

/**
 * /sitemap.xml, built from what is really published, so Google is only ever told about pages that exist.
 * (It used to be written at build time from the demo seed and listed titles that were never real, which
 * Search Console filed as "Discovered, currently not indexed" and soft 404s.)
 *
 * Fixed and legal pages come from src/seo/seo.js; titles that can be watched come from the public API
 * (SHARE_API_BASE, else production). Cached for an hour. If the API cannot be reached, the fixed pages are still
 * listed and nothing made up is: a short sitemap is always better than a wrong one.
 */
import { DEFAULT_API, LEGAL_TITLES, PAGES } from "../../src/seo/seo.js";

const TTL = 60 * 60 * 1000;
let cached = null; // { at, xml }

const apiBase = () => {
  const set = globalThis.Netlify?.env?.get?.("SHARE_API_BASE");
  return String(!set || set === "catalog" ? DEFAULT_API : set).replace(/\/+$/, "");
};
const siteUrl = () => String(globalThis.Netlify?.env?.get?.("SITE_URL") || "https://stream.theartistry360.com").replace(/\/+$/, "");

/** A title people can watch now: ready video, and published (or scheduled and its time has come). */
const watchable = (t) =>
  t.video?.status === "ready" &&
  (t.publishStatus === "published" || (t.publishStatus === "scheduled" && t.releaseAt && new Date(t.releaseAt) <= new Date()));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function titles() {
  try {
    const res = await fetch(`${apiBase()}/api/v1/streaming/titles`, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    return ((await res.json()).data ?? []).filter(watchable);
  } catch {
    return [];
  }
}

export async function buildSitemap() {
  const entries = [
    ...Object.entries(PAGES).filter(([, p]) => !p.noindex).map(([path]) => ({ path })),
    ...Object.keys(LEGAL_TITLES).map((slug) => ({ path: `/legal/${slug}` })),
    ...(await titles()).map((t) => ({ path: `/title/${t.id}`, at: t.updatedAt })),
  ];
  const site = siteUrl();
  const rows = entries.map((e) => `  <url><loc>${esc(`${site}${e.path}`)}</loc>${e.at ? `<lastmod>${esc(new Date(e.at).toISOString().slice(0, 10))}</lastmod>` : ""}</url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
}

export default async function sitemap() {
  if (!cached || Date.now() - cached.at > TTL) cached = { at: Date.now(), xml: await buildSitemap() };
  return new Response(cached.xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}

export const config = { path: "/sitemap.xml" };
