# 08 — Sharing and SEO

**Rule:** a shared link shows what it points at. A film link previews with that film's title, one line of synopsis and its image, Every other page shows the branded default card.

## Why an edge function

WhatsApp, Facebook, X, iMessage, Slack and LinkedIn build link previews with crawlers that read the first HTML and **never run JavaScript**. In a single-page app every URL returns the same `index.html`, so tags set by React never reach them. The card therefore has to be in the HTML as it leaves the server.

| Option | Verdict |
|---|---|
| React sets meta tags | Google sees them (it runs JS). **Link previews do not** |
| Pre-render a page per title at build | Goes stale the moment the Studio publishes; needs a rebuild |
| Full server rendering | A large rewrite for this one need |
| **Netlify Edge Function** (chosen) | Runs before the page is sent; always current; the app is unchanged |

## How it works

- `netlify/edge-functions/share-card.js` runs on every page (files excluded). Titles get their own card; the home page and every other page get the branded card, with the image and link built from **the address that was shared** (the Netlify URL before the domain is connected, the real domain after). A card pointing at an unresolvable domain shows no thumbnail, which is what happened while stream.theartistry360.com had no DNS. It looks the item up and swaps the head's `<title>`, description, canonical, `og:*` and `twitter:*` tags. Everyone gets the same HTML, crawler or not.
- **Links:** a `/watch/:id` link previews as its title page (canonical `/title/:id`). An unknown id keeps the default card, and a failed lookup never breaks the page.
- **Images:** 1200×630. Unsplash images are cropped to that on request. A title uses its backdrop, then its poster. Everything else uses `public/share/default.png` (the logo on black).
- **Data:**
  - Until the API exists: `public/share/catalog.json`, written at build time (`npm run build` runs `scripts/share-catalog.mjs` first) from the seed, published items only.
  - Once it does: set `SHARE_API_BASE` in Netlify's environment (e.g. `https://api.theartistry360.com`) and the function reads `GET /api/v1/streaming/titles/:id` instead. It needs public fields only, and a Studio edit shows in previews at once.
- **Defaults:** `index.html` carries the default card for every other page.

## In the app

`hooks/usePageMeta.js` sets the tab title ("Kings & Queens · Artistry360 Stream") and description per page. Google reads these because it renders the app, and they also make browser history readable.

## Search engines

The same build step writes `public/sitemap.xml` (home, Films, Plans, every published title) and `public/robots.txt`. The robots file keeps My List, sign-in and password reset out of the index and points to the sitemap. Both are generated, not committed.

## Checking a card after a deploy

Paste a film link into Facebook's Sharing Debugger, opengraph.xyz or a WhatsApp chat to yourself. WhatsApp caches a preview for a while, so add `?v=2` to see a change straight away. Locally, the function can be exercised with `netlify dev`.

## theartistry360.com

The main site can use the same approach for voting campaigns and talent profiles: `/voting/:campaignId` would show the campaign's poster, a natural thing to share to get votes. It isn't built yet.
