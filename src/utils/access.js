/* Access Rules */
// MOU 3D: free tier (signed in, with ads), subscription, or pay-per-view.

/** What a rental lasts, counted from payment. One number for every screen. */
export const RENTAL_HOURS = 24;

/** A ticket link must be an https address; anything else is ignored. */
export function isHttpsUrl(value) {
  try {
    return new URL(String(value)).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * A pay-per-view film's premiere, if one is announced and still ahead:
 * `{ upcoming, at, ticketUrl }`. The fee is `access.priceUGX` and does not
 * depend on the date: anyone can watch before the premiere by paying it.
 * `ticketUrl` is only returned when it is an https address.
 */
export function premiereOf(access, now = new Date()) {
  const at = access?.premiereAt ? new Date(access.premiereAt) : null;
  const upcoming = Boolean(at) && !Number.isNaN(at.getTime()) && at.getTime() > now.getTime();
  return { upcoming, at: upcoming ? at : null, ticketUrl: upcoming && isHttpsUrl(access?.ticketUrl) ? access.ticketUrl : null };
}

/** "a week", "3 months"… for a plan; a period the site doesn't know yet reads "N days". */
const PERIOD_WORDS = { week: "week", month: "month", quarter: "3 months", year: "year" };
export const periodLabel = (plan) => PERIOD_WORDS[plan?.interval] ?? (plan?.period?.days ? `${plan.period.days} days` : "period");

export function accessFor(title, member) {
  const tier = title?.access?.tier;
  // Free titles carry ads, except for subscribers, who never see them.
  if (tier === "free") return member ? { ok: true, ads: member.subscription?.status !== "active" } : { ok: false, reason: "signin" };
  if (!member) return { ok: false, reason: "signin" };
  if (tier === "subscription") return member.subscription?.status === "active" ? { ok: true } : { ok: false, reason: "subscribe" };
  if (tier === "ppv") return member.purchases?.includes(title.id) ? { ok: true } : { ok: false, reason: "buy", priceUGX: title.access.priceUGX };
  return { ok: false, reason: "signin" };
}

export const TIER_LABEL = { free: "Free", subscription: "Subscribers", ppv: "Pay-per-view" };

/** "94% liked it": Love this! and I like this, over every rating. */
export function likedPercent(ratings) {
  if (!ratings) return null;
  const total = (ratings.love ?? 0) + (ratings.like ?? 0) + (ratings.meh ?? 0);
  return total >= 20 ? Math.round((((ratings.love ?? 0) + (ratings.like ?? 0)) / total) * 100) : null;
}

