/* Age Ratings (parental guidance; the Love/Like buttons are utils/ratings.js) */
// Parental guidance: each rating's meaning and colour, and the content
// warnings a title can carry. The Studio sets both per title; the badge,
// the title page and the player's opening notice all read from here.

export const AGE_RATINGS = {
  G: { label: "G", name: "General", meaning: "Suitable for all ages.", tone: "border-success/60 text-success" },
  PG: { label: "PG", name: "Parental guidance", meaning: "Some scenes may not suit young children. Parents may want to watch first.", tone: "border-info/60 text-info" },
  "13+": { label: "13+", name: "Teens", meaning: "Suitable for ages 13 and over.", tone: "border-gold/60 text-gold" },
  "16+": { label: "16+", name: "Older teens", meaning: "Suitable for ages 16 and over.", tone: "border-brand/60 text-brand" },
  "18+": { label: "18+", name: "Adults only", meaning: "For adults only.", tone: "border-danger/60 text-danger" },
};

export const ratingOf = (value) => AGE_RATINGS[value] ?? null;

/** Content warnings, in the order they're listed. */
export const ADVISORIES = ["Violence", "Language", "Sexual content", "Nudity", "Drug use", "Alcohol", "Smoking", "Frightening scenes", "Discrimination", "Self-harm"];

/** "Violence, language and alcohol". */
export function advisoryLine(list = []) {
  const items = list.map((a, i) => (i === 0 ? a : a.toLowerCase()));
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0] ?? "";
}

/** Ratings in order, lowest first: a limit of PG allows G and PG. */
export const RATING_ORDER = ["G", "PG", "13+", "16+", "18+"];
export const aboveLimit = (rating, limit) =>
  Boolean(limit) && RATING_ORDER.indexOf(rating) > RATING_ORDER.indexOf(limit);
