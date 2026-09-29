/* Share Catalogue */
// Writes public/share/catalog.json at build time: the few fields a link
// preview needs for every public title (title, one line, a 1200×630
// image). The share-card edge function reads it until the API serves the
// same data (SHARE_API_BASE; see docs/06-backend-integration.md).
import { mkdirSync, writeFileSync } from "node:fs";

import { streamingTitlesSeed } from "../src/data/streamingTitles.js";
import { streamingTypesSeed } from "../src/data/streamingTypes.js";

const typeName = (id) => streamingTypesSeed.find((t) => t.id === id)?.name ?? "";
const visible = (t) =>
  t.video?.status === "ready" &&
  (t.publishStatus === "published" || (t.publishStatus === "scheduled" && t.releaseAt && new Date(t.releaseAt) <= new Date()));

/** Link previews want 1200×630; Unsplash can crop to that on request. */
const card = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname !== "images.unsplash.com") return url;
    for (const [k, v] of Object.entries({ w: "1200", h: "630", fit: "crop", auto: "format", q: "80" })) u.searchParams.set(k, v);
    return u.toString();
  } catch {
    return url;
  }
};
const oneLine = (text = "", max = 200) => {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

const titles = Object.fromEntries(
  streamingTitlesSeed.filter(visible).map((t) => [
    t.id,
    {
      title: t.title,
      description: oneLine(t.synopsis || t.description),
      image: card(t.backdrop || t.poster),
      kind: [typeName(t.type), t.releaseYear].filter(Boolean).join(" · "),
    },
  ]),
);


mkdirSync("public/share", { recursive: true });
writeFileSync("public/share/catalog.json", JSON.stringify({ generatedAt: new Date().toISOString(), titles }));
console.log(`share catalogue: ${Object.keys(titles).length} titles`);

// A sitemap of every public page and film, so search engines find them
// all; robots.txt points to it. The domain is the production one.
const SITE = "https://stream.theartistry360.com";
const urls = [
  "/", "/films", "/plans",
  ...Object.keys(titles).map((id) => `/title/${id}`),
];
const xml = urls.map((u) => `  <url><loc>${SITE}${u.replace(/&/g, "&amp;")}</loc></url>`).join("\n");
writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`);
writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\nDisallow: /my-list\nDisallow: /sign-in\nDisallow: /sign-up\nDisallow: /forgot-password\nDisallow: /reset-password\n\nSitemap: ${SITE}/sitemap.xml\n`);
