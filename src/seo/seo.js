/* SEO */
// What each page tells search engines and link previews. Pure, with no
// imports: the app (hooks/usePageMeta.js) and the share-card edge function
// both read it, so a tab title and a WhatsApp preview never disagree.
// See docs/08-sharing-and-seo.md.

export const SITE = "The Artistry360 Stream";
export const DEFAULT_DESCRIPTION =
  "Films, series, documentaries and behind the scenes from The Artistry360, Kampala. Watch free titles, subscribe, or rent a film with MTN MoMo or Airtel Money.";

/** Fixed pages. `noindex` pages are also disallowed in robots.txt. */
export const PAGES = {
  "/": { title: "", description: DEFAULT_DESCRIPTION },
  "/films": { title: "Films", description: "Every film, series, short, documentary and behind-the-scenes from The Artistry360, made in Kampala." },
  "/plans": { title: "Plans", description: "Watch every film, series and documentary from The Artistry360. Pay by MTN MoMo, Airtel Money or card; cancel any time." },
  "/search": { title: "Search", description: DEFAULT_DESCRIPTION, noindex: true },
  "/my-list": { title: "My List", noindex: true },
  "/account": { title: "Account & settings", noindex: true },
  "/sign-in": { title: "Sign in", noindex: true },
  "/sign-up": { title: "Create your account", noindex: true },
  "/forgot-password": { title: "Reset your password", noindex: true },
  "/reset-password": { title: "Set a new password", noindex: true },
};

/** The Films tabs (?tab=…), for their own titles and descriptions. Mirrors FILM_TABS in utils/catalog.js. */
export const TAB_LABELS = { films: "Films", series: "Series", shorts: "Shorts", documentaries: "Documentaries", bts: "Behind the Scenes" };
export const TAB_DESCRIPTIONS = {
  films: "Feature films from The Artistry360, made in Kampala with our actors.",
  series: "Series from The Artistry360: every season and episode in one place.",
  shorts: "Short films from The Artistry360 and its actors.",
  documentaries: "Documentaries from The Artistry360 on Uganda's actors, stages and film scene.",
  bts: "Behind the scenes at The Artistry360: on set, at castings and in the edit.",
};

export const LEGAL_TITLES = {
  terms: "Terms of Use",
  privacy: "Privacy Policy",
  refunds: "Refunds & Cancellation",
  community: "Community Guidelines",
  cookies: "Cookies & Ads",
  copyright: "Copyright",
};

export const pageTitle = (title) => (title ? `${title} · ${SITE}` : SITE);

/** A fixed page or a legal one, or null for title pages and unknown paths. */
export function pageMeta(pathname, search = "") {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const [, section, slug] = path.split("/");
  if (section === "legal" && LEGAL_TITLES[slug]) return { title: LEGAL_TITLES[slug], description: `${LEGAL_TITLES[slug]} for The Artistry360 Stream.` };
  const page = PAGES[path];
  if (!page) return null;
  const tab = path === "/films" ? new URLSearchParams(search).get("tab") : null;
  return { ...page, title: TAB_LABELS[tab] || page.title, description: TAB_DESCRIPTIONS[tab] || page.description || DEFAULT_DESCRIPTION };
}

const ORG = {
  "@type": "Organization",
  name: "The Artistry360",
  url: "https://theartistry360.com",
  sameAs: ["https://www.instagram.com/theartistry360/", "https://www.youtube.com/@theartistry360", "https://www.tiktok.com/@theartistry360"],
};

export const homeJsonLd = (origin) => [{ "@context": "https://schema.org", "@type": "WebSite", name: SITE, url: `${origin}/`, publisher: ORG }];

/**
 * A title's structured data: Movie for a film, TVSeries for a series,
 * VideoObject for the rest (shorts, documentaries, behind the scenes).
 * `t` is the catalogue entry: { title, description, type, year, releaseAt,
 * ageRating, genres[], image }.
 */
export function titleJsonLd(t, url) {
  const type = t.type === "film" ? "Movie" : t.type === "series" ? "TVSeries" : "VideoObject";
  const base = { "@context": "https://schema.org", "@type": type, name: t.title, description: t.description, image: t.image, url };
  const date = t.releaseAt || (t.year ? `${t.year}-01-01` : undefined);
  if (type === "VideoObject") return { ...base, thumbnailUrl: t.image, uploadDate: date, genre: t.genres };
  return { ...base, datePublished: date, genre: t.genres, contentRating: t.ageRating, productionCompany: ORG };
}

/** A short stamp of what a title's share card shows; it goes in the image URL, so a changed poster is fetched afresh (apps cache previews). */
export function cardVersion(t) {
  const s = [t.title, t.kind, t.poster, t.backdrop].join("|");
  let x = 5381;
  for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) >>> 0;
  return x.toString(36);
}
