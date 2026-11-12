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

- `netlify/edge-functions/share-card.js` runs on every page (files excluded) and swaps the head's `<title>`, description, robots, canonical, `og:*`, `twitter:*` and structured data before the page is sent, with links built from **the address that was shared** (the Netlify URL before the domain is connected, the real domain after). Everyone gets the same HTML, crawler or not.
- **Titles and descriptions** come from `src/seo/seo.js` (pure, no imports), which the app's `hooks/usePageMeta.js` reads too, so a tab title and a preview never disagree: fixed pages (`PAGES`), each Films tab (`?tab=documentaries` gets its own), and the legal pages.
- **Films and series** get a **generated card**, `/share/title/<id>.jpg` (`netlify/functions/title-card.mjs`, drawn by `netlify/shared/title-card.js`): the whole poster, never cropped, on its darkened backdrop, with the title, type and year, "Watch on The Artistry360 Stream" and the logo. Link previews are wide (1200×630) and posters are tall, so a poster on its own lost its top and bottom, and the old card used the backdrop, a different picture from the poster for most titles. The card is a JPEG of about 100 KB (WhatsApp drops images over about 300 KB), drawn with satori and resvg (WebAssembly, served from `/share/resvg.wasm`) in Quicksand (`/share/fonts`). It is a Netlify Function, not an Edge Function: drawing takes far more than the edge's CPU budget.
- **Fresh after a change:** the image URL carries `?v=<version>` (a stamp of title, type, poster and backdrop; the API's `updatedAt` once it exists). A new poster is a new URL, so WhatsApp and Facebook fetch it instead of their cached copy. Each version is drawn once and then served from Netlify's CDN (`Netlify-CDN-Cache-Control: durable, immutable`).
- **Default card:** `public/share/stream-card-v2.jpg` is the Open Graph image for every page without its own card: "STREAM", the logo, "Films, series and documentaries", the payment options and a film strip (Films, Series, Documentaries). Classes are not on this site (they live on theartistry360.com), so they are not on the card. It is deliberately different from the theartistry360.com card. A new design gets a new file name (`-v2`, `-v3`), because WhatsApp and Facebook cache the image by its URL. `stream-card.jpg` and `default.png` hold the same design for links shared before.
- **Links:** a `/watch/:id` link previews as its title page (canonical `/title/:id`) and says `noindex`. An unknown id keeps the default card; a failed lookup or drawing never breaks the page (the image falls back to `/share/stream-card-v2.jpg`).
- **Structured data:** a film is a `Movie`, a series a `TVSeries`, everything else a `VideoObject` (name, description, poster, date, genres, age rating). The home page carries `WebSite` with The Artistry360 as publisher.
- **Data:**
  - Until the API exists: `public/share/catalog.json`, written at build time (`npm run build` runs `scripts/share-catalog.mjs` first) from the seed, published items only, with each title's poster, backdrop, type, year, genres and card version. **Titles added or changed in the Studio only reach previews once the API is connected.**
  - Once it does: set `SHARE_API_BASE` in Netlify (e.g. `https://api.theartistry360.com`); both functions then read `GET /api/v1/streaming/titles/:id`. It must return `poster`, `backdrop`, `typeName`, `releaseYear`, `categoryNames` and `updatedAt`, and the poster and backdrop must be **permanent public URLs** (not expiring signed links), or previews break later.
- **Defaults:** `index.html` carries the default card for every other page.

## In the app

`hooks/usePageMeta.js` sets the tab title ("Kings & Queens · The Artistry360 Stream"), the description and, on private pages (My List, account, sign-in and sign-up, password reset, search, watch, not found), `noindex`. Google reads these because it renders the app.

## Search engines

The same build step writes `public/sitemap.xml` (home, Films, Plans, the legal pages, every published title) and `public/robots.txt`, which keeps the private pages out and points to the sitemap. `/watch` stays crawlable so a shared watch link still gets its card. All generated, not committed.

## Checking a card after a deploy

Paste a film link into Facebook's Sharing Debugger, opengraph.xyz or a WhatsApp chat to yourself. WhatsApp caches a preview for a while, so add `?v=2` to see a change straight away. Open `/share/title/<id>.jpg` to see a card on its own. Locally, the functions can be exercised with `netlify dev`.

## theartistry360.com

The main site does the same for voting campaigns, talent profiles and news (its `docs/18-seo.md`): a shared campaign shows its poster and "Vote: …".

## What Google is told (sitemap, 404s, redirects)

Search Console's "Why pages aren't indexed" came from two real bugs, now fixed, plus things that are correct:

- **The sitemap is live, not from the demo seed.** `netlify/edge-functions/sitemap.js` serves `/sitemap.xml` from the public API (titles that can be watched: ready video and published, or scheduled and due) plus the fixed and legal pages, cached for an hour, with `lastmod` from the title's `updatedAt`. It used to be written at build time from the seed and listed titles that never existed. If the API cannot be reached it lists only the fixed pages. `public/sitemap.xml` (fixed pages only) is just a fallback file.
- **Unknown addresses answer 404.** `isKnownPath` (`src/seo/seo.js`) says which paths the site has; the edge function answers anything else, and any title the API says does not exist, with status **404** (the app shell, `noindex`, so a visitor still sees the Not-found page). A failed lookup (API down or 5xx) never 404s a page. `scripts/share-catalog.mjs` fails the build if a route in `router.jsx` is missing from `isKnownPath`.
- **One address per page.** A trailing slash (`/films/`) 301s to the bare address; `/terms` and `/privacy` 301 to `/legal/terms` and `/legal/privacy`. `/watch/:id` stays crawlable for its share card but is `noindex` with its canonical on `/title/:id`.
- **The API is the default.** The edge functions read `https://api.theartistry360.com` unless `SHARE_API_BASE` is set (`SHARE_API_BASE=catalog` uses the demo seed, for local demos). Nothing has to be configured in Netlify.
- **Expected, not bugs:** "Excluded by noindex" for the private pages (sign-in, account, search, my list, watch and payment return). Google's ownership files (`/google….html`) and the verification `<meta>` in `index.html` are left alone by the edge function.
