/* Share Catalogue */
// Writes, before every build (npm "prebuild"), from the seed:
// - public/share/catalog.json: what a link preview needs for every public
//   title (title, one line, poster and backdrop for the generated card,
//   type, year, genres). Only for local demos now (SHARE_API_BASE=catalog): the
//   edge functions read the live API by default (docs/08-sharing-and-seo.md).
// - public/share/resvg.wasm: the image engine the card function loads.
// - public/sitemap.xml: the fixed pages only. The real sitemap, with the titles that can be watched, is served by
//   netlify/edge-functions/sitemap.js. The demo seed is never listed: those titles do not exist.
// - public/robots.txt.
// Then it checks every route in src/routes/router.jsx is one the edge treats as a real page (isKnownPath);
// otherwise that page would answer 404 to Google.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { streamingCategoriesSeed } from "../src/data/streamingCategories.js";
import { streamingTitlesSeed } from "../src/data/streamingTitles.js";
import { streamingTypesSeed } from "../src/data/streamingTypes.js";
import { PAGES, LEGAL_TITLES, cardVersion, isKnownPath } from "../src/seo/seo.js";

const typeName = (id) => streamingTypesSeed.find((t) => t.id === id)?.name ?? "";
const genreName = (id) => streamingCategoriesSeed.find((c) => c.id === id)?.name;
const visible = (t) =>
  t.video?.status === "ready" &&
  (t.publishStatus === "published" || (t.publishStatus === "scheduled" && t.releaseAt && new Date(t.releaseAt) <= new Date()));
const oneLine = (text = "", max = 200) => {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

const titles = Object.fromEntries(
  streamingTitlesSeed.filter(visible).map((t) => {
    const entry = {
      title: t.title,
      description: oneLine(t.synopsis || t.description),
      kind: [typeName(t.type), t.releaseYear].filter(Boolean).join(" · "),
      type: t.type,
      year: t.releaseYear,
      releaseAt: t.releaseAt,
      ageRating: t.ageRating,
      genres: (t.categoryIds ?? []).map(genreName).filter(Boolean),
      poster: t.poster || null,
      backdrop: t.backdrop || null,
    };
    return [t.id, { ...entry, version: cardVersion(entry) }];
  }),
);

mkdirSync("public/share", { recursive: true });
writeFileSync("public/share/catalog.json", JSON.stringify({ generatedAt: new Date().toISOString(), titles }));
copyFileSync("node_modules/@resvg/resvg-wasm/index_bg.wasm", "public/share/resvg.wasm");
console.log(`share catalogue: ${Object.keys(titles).length} titles`);

// A sitemap of every public page and title; robots.txt points to it and
// keeps the private pages out. /watch stays crawlable so a shared watch link
// still gets its card; it says noindex and points its canonical at /title. The domain is the production one.
const SITE = "https://stream.theartistry360.com";
const urls = [
  ...Object.entries(PAGES).filter(([, p]) => !p.noindex).map(([path]) => path),
  ...Object.keys(LEGAL_TITLES).map((slug) => `/legal/${slug}`),
];
const xml = urls.map((u) => `  <url><loc>${SITE}${u.replace(/&/g, "&amp;")}</loc></url>`).join("\n");
writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`);
const privatePaths = Object.entries(PAGES).filter(([, p]) => p.noindex).map(([path]) => path);
writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\n${privatePaths.map((p) => `Disallow: ${p}`).join("\n")}\n\nSitemap: ${SITE}/sitemap.xml\n`);

// A route the edge would 404 is a page nobody could reach from a search result. Fail the build, name it.
const routePaths = [...readFileSync("src/routes/router.jsx", "utf8").matchAll(/path:\s*"([^"]+)"/g)]
  .map((m) => m[1])
  .filter((r) => r !== "*")
  .map((r) => `/${r}`.replace(":doc", "terms").replace(/:[A-Za-z]+/g, "x"));
const missing = routePaths.filter((r) => !isKnownPath(r));
if (missing.length) {
  console.error(`share: these routes in router.jsx are not known to isKnownPath (src/seo/seo.js), so Google would get a 404 for them: ${missing.join(", ")}`);
  process.exit(1);
}
console.log(`share: ${routePaths.length} routes checked`);
