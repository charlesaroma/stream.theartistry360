/* Title Card Image (Netlify Function) */

/**
 * /share/title/<id>.jpg: the 1200 × 630 card a shared film or series link
 * shows (lib/title-card.js draws it). The share card points og:image here
 * with ?v=<version>, so each version is drawn once and then served from
 * Netlify's CDN; a new poster means a new URL, which apps fetch afresh.
 * An unknown title gets the default card.
 *
 * A Function, not an Edge Function: drawing and encoding the image takes
 * far more than the edge's ~50 ms CPU budget per request.
 */
import { lookupTitle } from "../shared/lookup.js";
import { renderTitleCard } from "../shared/title-card.js";

export default async function titleCard(request) {
  const url = new URL(request.url);
  const id = decodeURIComponent(url.pathname.split("/").pop() ?? "").replace(/\.jpg$/, "");
  let t = null;
  try {
    t = await lookupTitle(url.origin, id);
  } catch {
    // Falls through to the default card.
  }
  if (!t) return Response.redirect(new URL("/share/default.png", url.origin), 302);

  const load = async (path) => {
    const res = await fetch(new URL(path, url.origin));
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.arrayBuffer();
  };
  try {
    const jpg = await renderTitleCard(t, load);
    return new Response(jpg, {
      headers: {
        "content-type": "image/jpeg",
        "cache-control": "public, max-age=86400",
        // Each version is a different URL, so the CDN can keep it for good.
        "netlify-cdn-cache-control": "public, durable, max-age=31536000, immutable",
      },
    });
  } catch {
    return Response.redirect(new URL("/share/default.png", url.origin), 302);
  }
}

export const config = { path: "/share/title/*" };
