/* Share Card (Netlify Edge Function) */

/**
 * Link previews (WhatsApp, Facebook, X, iMessage, Slack, LinkedIn) come from
 * crawlers that read the first HTML and never run JavaScript, so a
 * single-page app shows the same generic card for every link. This runs on
 * Netlify's edge before the page is sent and writes the page's own title,
 * description, canonical, image and structured data into <head>. A film or
 * series gets its generated card (/share/title/<id>.jpg: the whole poster,
 * the title, the logo); other pages get their own title and description
 * from src/seo/seo.js, the same file the app reads.
 * Everyone gets the same HTML (crawler or not); the app itself is unchanged.
 *
 * Search engines also read the status: an address the site does not have, or
 * a title the API says does not exist, answers 404 (with the app shell, so a
 * visitor still sees the site's own Not-found page) instead of a 200 that
 * Google files as a soft 404. A failed lookup never causes a 404.
 */
import { DEFAULT_DESCRIPTION, REDIRECTS, SITE, homeJsonLd, isKnownPath, pageMeta, pageTitle, titleJsonLd } from "../../src/seo/seo.js";
import { lookupTitle } from "../shared/lookup.js";

export default async function shareCard(request, context) {
  const url = new URL(request.url);
  // /films/ and /films are one page; old addresses redirect to the current ones.
  const bare = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") || "/" : url.pathname;
  if (REDIRECTS[bare]) return permanent(`${REDIRECTS[bare]}${url.search}`, url);
  if (bare !== url.pathname) return permanent(`${bare}${url.search}`, url);
  const response = await context.next();
  if (url.pathname.startsWith("/payment/return")) return framableBySelf(response);
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
  if (card.noindex) headers.set("x-robots-tag", "noindex");
  return new Response(withCard(html, card), { status: card.status ?? response.status, headers });
}

/**
 * PesaPal's return page loads inside the site's own PesaPal window, so it
 * alone may be framed, and only by this site (every other page: never,
 * public/_headers). Never indexed.
 */
function framableBySelf(response) {
  const headers = new Headers(response.headers);
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("content-security-policy", "frame-ancestors 'self'");
  headers.set("x-robots-tag", "noindex");
  return new Response(response.body, { status: response.status, headers });
}

/** A permanent redirect to a path on this site. */
function permanent(path, url) {
  return new Response(null, { status: 301, headers: { location: new URL(path, url.origin).toString(), "cache-control": "public, max-age=3600" } });
}

/** The card for an address that does not exist: a 404, never indexed. */
const notFoundCard = (origin, pathname) => ({
  title: pageTitle("Page not found"),
  description: DEFAULT_DESCRIPTION,
  image: `${origin}/share/stream-card-v2.jpg`,
  url: `${origin}${pathname}`,
  type: "website",
  noindex: true,
  status: 404,
  jsonLd: [],
});

// Every page, so even the home page's card points at the address that was
// actually shared (the Netlify URL today, the real domain later). Files skip it.
export const config = {
  path: "/*",
  // Files skip it too, including Google's ownership file (/google….html) and any other real .html file.
  excludedPath: ["/*.html", "/assets/*", "/share/*", "/captions/*", "/brand/*", "/*.png", "/*.ico", "/*.svg", "/*.webmanifest", "/*.xml", "/*.txt", "/*.json", "/*.js", "/*.css", "/*.wasm"],
};

/** What the URL points at, as { title, description, image, url, type, noindex?, jsonLd? }. */
export async function cardFor(url) {
  const [, section, id] = url.pathname.split("/");
  const origin = url.origin;

  // A page the site does not have: a real 404.
  if (!isKnownPath(url.pathname)) return notFoundCard(origin, url.pathname);

  if ((section === "title" || section === "watch") && id) {
    const t = await lookupTitle(origin, id); // null: the API says there is no such title
    if (t === null) return notFoundCard(origin, url.pathname);
    if (t) {
      const canonical = `${origin}/title/${encodeURIComponent(id)}`;
      return {
        title: pageTitle(t.title),
        description: [t.kind, t.description].filter(Boolean).join(" · "),
        image: `${origin}/share/title/${encodeURIComponent(id)}.jpg?v=${t.version}`,
        url: canonical,
        type: t.type === "series" ? "video.tv_show" : "video.movie",
        // A watch link previews like its title page but isn't indexed itself.
        noindex: section === "watch",
        jsonLd: [titleJsonLd({ ...t, image: t.poster || t.backdrop }, canonical)],
      };
    }
  }
  // Fixed pages, legal pages, and everything else (unknown titles too):
  // the branded card, with that page's own title and description.
  const page = pageMeta(url.pathname, url.search);
  return {
    title: pageTitle(page?.title),
    description: page?.description || DEFAULT_DESCRIPTION,
    image: `${origin}/share/stream-card-v2.jpg`,
    url: `${origin}${url.pathname === "/" ? "/" : url.pathname}`,
    type: "website",
    noindex: Boolean(page?.noindex),
    jsonLd: url.pathname === "/" ? homeJsonLd(origin) : [],
  };
}

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Swaps the default <title>, description, canonical and social tags for the card's. */
export function withCard(html, card) {
  const description = card.description || DEFAULT_DESCRIPTION;
  const tags = [
    `<title>${esc(card.title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    card.noindex ? `<meta name="robots" content="noindex" />` : "",
    `<link rel="canonical" href="${esc(card.url)}" />`,
    `<meta property="og:site_name" content="${SITE}" />`,
    `<meta property="og:type" content="${esc(card.type)}" />`,
    `<meta property="og:title" content="${esc(card.title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(card.url)}" />`,
    `<meta property="og:image" content="${esc(card.image)}" />`,
    `<meta property="og:image:type" content="${card.image.includes(".jpg") ? "image/jpeg" : "image/png"}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(card.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(card.title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(card.image)}" />`,
    ...(card.jsonLd ?? []).map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, "\\u003c")}</script>`),
  ]
    .filter(Boolean)
    .join("\n    ");
  const stripped = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "");
  return stripped.replace(/<\/head>/i, `    ${tags}\n  </head>`);
}
