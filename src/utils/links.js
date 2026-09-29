/* Link Safety */

/**
 * Links that come from the Studio (WhatsApp, the announcement) and from the
 * address bar (?next=) are checked before use. A compromised or mistaken
 * Studio entry must never put a `javascript:`, `data:` or look-alike site
 * link in front of every viewer, and a crafted ?next= must never send a
 * freshly signed-in member to another site (an open redirect).
 */

/** A page on this site, e.g. "/films". "//other.site" and "/\\other" are not. */
export const isSitePath = (value) => typeof value === "string" && /^\/(?![/\\])/.test(value);

/** The link if it is https:// or a page on this site, otherwise null (render nothing). */
export function safeHref(value) {
  if (!value || typeof value !== "string") return null;
  const link = value.trim();
  if (isSitePath(link)) return link;
  try {
    return new URL(link).protocol === "https:" ? link : null;
  } catch {
    return null;
  }
}

/** Where to go after sign-in or payment: only ever a page on this site. */
export const safeNext = (value, fallback = "/") => (isSitePath(value) ? value : fallback);
