/* Share Card (Netlify Edge Function) */

/**
 * Link previews (WhatsApp, Facebook, X, iMessage, Slack, LinkedIn) come from
 * crawlers that read the first HTML and never run JavaScript, so a
 * single-page app shows the same generic card for every link. This runs on
 * Netlify's edge before the page is sent: for a film, a series or a class
 * it writes that item's title, one line, image and link into <head>.
 * Everyone gets the same HTML (crawler or not); the app itself is unchanged.
 *
 * Data: the API when SHARE_API_BASE is set (GET streaming/titles/:id,
 * public fields only), otherwise /share/catalog.json,
 * written at build time from the seed (scripts/share-catalog.mjs).
 */

const SITE = "Artistry360 Stream";
const DEFAULT_DESCRIPTION = "Films from The Artistry360, Kampala.";
const TTL = 5 * 60 * 1000;
let cached = null; // { at, catalog }

export default async function shareCard(request, context) {
  const url = new URL(request.url);
  const response = await context.next();
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return response;

  let card = null;
  try {
    card = await cardFor(url);
  } catch {
    // No data: the page keeps its default card rather than failing.
  }
  if (!card) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  return new Response(withCard(html, card), { status: response.status, headers });
}

export const config = { path: ["/title/*", "/watch/*"] };

/** What the URL points at, as { title, description, image, url, type }. */
export async function cardFor(url) {
  const [, section, id] = url.pathname.split("/");
  const origin = url.origin;
  const image = (src) => src || `${origin}/share/default.png`;

  if ((section === "title" || section === "watch") && id) {
    const t = await lookup(url, "titles", id);
    if (!t) return null;
    return {
      title: `${t.title} · ${SITE}`,
      description: [t.kind, t.description].filter(Boolean).join(" — "),
      image: image(t.image),
      url: `${origin}/title/${encodeURIComponent(id)}`,
      type: "video.movie",
    };
  }
  return null;
}

async function lookup(url, kind, id) {
  const api = globalThis.Netlify?.env?.get?.("SHARE_API_BASE");
  if (api) {
    const res = await fetch(`${api.replace(/\/+$/, "")}/api/v1/streaming/${kind}/${encodeURIComponent(id)}`, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data
      ? { title: data.title, description: data.synopsis ?? "", image: data.backdrop ?? data.poster ?? null, kind: "" }
      : null;
  }
  if (!cached || Date.now() - cached.at > TTL) {
    const res = await fetch(new URL("/share/catalog.json", url.origin));
    cached = { at: Date.now(), catalog: res.ok ? await res.json() : { titles: {} } };
  }
  return cached.catalog[kind]?.[id] ?? null;
}

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Swaps the default <title>, description, canonical and social tags for the card's. */
export function withCard(html, card) {
  const tags = [
    `<title>${esc(card.title)}</title>`,
    `<meta name="description" content="${esc(card.description || DEFAULT_DESCRIPTION)}" />`,
    `<link rel="canonical" href="${esc(card.url)}" />`,
    `<meta property="og:site_name" content="${SITE}" />`,
    `<meta property="og:type" content="${esc(card.type)}" />`,
    `<meta property="og:title" content="${esc(card.title)}" />`,
    `<meta property="og:description" content="${esc(card.description || DEFAULT_DESCRIPTION)}" />`,
    `<meta property="og:url" content="${esc(card.url)}" />`,
    `<meta property="og:image" content="${esc(card.image)}" />`,
    `<meta property="og:image:alt" content="${esc(card.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(card.title)}" />`,
    `<meta name="twitter:description" content="${esc(card.description || DEFAULT_DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${esc(card.image)}" />`,
  ].join("\n    ");
  const stripped = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "");
  return stripped.replace(/<\/head>/i, `    ${tags}\n  </head>`);
}
