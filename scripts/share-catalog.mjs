/* Share Catalogue */
// Writes, before every build (npm "prebuild"), from the seed:
// - public/share/catalog.json: what a link preview needs for every public
//   title (title, one line, poster and backdrop for the generated card,
//   type, year, genres). The edge functions read it until the API serves
//   the same (SHARE_API_BASE; docs/08-sharing-and-seo.md).
// - public/share/resvg.wasm: the image engine the card function loads.
// - public/sitemap.xml and public/robots.txt.
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";

import { streamingCategoriesSeed } from "../src/data/streamingCategories.js";
import { streamingTitlesSeed } from "../src/data/streamingTitles.js";
import { streamingTypesSeed } from "../src/data/streamingTypes.js";
import { PAGES, LEGAL_TITLES, cardVersion } from "../src/seo/seo.js";

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
  ...Object.keys(titles).map((id) => `/title/${id}`),
];
const xml = urls.map((u) => `  <url><loc>${SITE}${u.replace(/&/g, "&amp;")}</loc></url>`).join("\n");
writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`);
const privatePaths = Object.entries(PAGES).filter(([, p]) => p.noindex).map(([path]) => path);
writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\n${privatePaths.map((p) => `Disallow: ${p}`).join("\n")}\n\nSitemap: ${SITE}/sitemap.xml\n`);
