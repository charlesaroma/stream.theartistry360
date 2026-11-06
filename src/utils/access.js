/* Access Rules */
// MOU 3D: free tier (signed in, with ads), subscription, or pay-per-view.

/** What a rental lasts, counted from payment. One number for every screen. */
export const RENTAL_HOURS = 24;

export const PPV_STAGE_LABEL = { early: "Early access", premiere: "Premiere price", standard: "" };

const DAY = 86_400_000;

/**
 * The pay-per-view price right now: early access before the premiere,
 * premiere pricing for `premiereDays` after it, then standard. A title with no
 * schedule keeps its flat `priceUGX`. Display only: the server charges its own
 * price. Same rule as the Studio's utils/streaming.js.
 */
export function ppvStage(access, now = new Date()) {
  const s = access?.ppv;
  if (!s?.premiereAt) return { stage: "standard", priceUGX: access?.priceUGX ?? 0, nextChangeAt: null };
  const start = new Date(s.premiereAt).getTime();
  const end = start + s.premiereDays * DAY;
  const t = now.getTime();
  if (t < start) return { stage: "early", priceUGX: s.earlyUGX, nextChangeAt: new Date(start).toISOString() };
  if (t < end) return { stage: "premiere", priceUGX: s.premiereUGX, nextChangeAt: new Date(end).toISOString() };
  return { stage: "standard", priceUGX: s.standardUGX, nextChangeAt: null };
}

/** "a week", "3 months"… for a plan; a period the site doesn't know yet reads "N days". */
const PERIOD_WORDS = { week: "week", month: "month", quarter: "3 months", year: "year" };
export const periodLabel = (plan) => PERIOD_WORDS[plan?.interval] ?? (plan?.period?.days ? `${plan.period.days} days` : "period");

/**
 * Subscribers watch a pay-per-view film once it reaches the standard price;
 * early access and the premiere stay paid. Same rule as the API (services/streaming/pricing.mjs).
 */
const includedInPlan = (title) => title?.access?.tier === "ppv" && ppvStage(title.access).stage === "standard";

export function accessFor(title, member) {
  const tier = title?.access?.tier;
  // Free titles carry ads, except for subscribers, who never see them.
  if (tier === "free") return member ? { ok: true, ads: member.subscription?.status !== "active" } : { ok: false, reason: "signin" };
  if (!member) return { ok: false, reason: "signin" };
  if (tier === "subscription") return member.subscription?.status === "active" ? { ok: true } : { ok: false, reason: "subscribe" };
  if (tier === "ppv") {
    if (member.purchases?.includes(title.id)) return { ok: true };
    if (member.subscription?.status === "active" && includedInPlan(title)) return { ok: true };
    return { ok: false, reason: "buy", ...ppvStage(title.access) };
  }
  return { ok: false, reason: "signin" };
}

export const TIER_LABEL = { free: "Free", subscription: "Subscribers", ppv: "Pay-per-view" };

/** "94% liked it": Love this! and I like this, over every rating. */
export function likedPercent(ratings) {
  if (!ratings) return null;
  const total = (ratings.love ?? 0) + (ratings.like ?? 0) + (ratings.meh ?? 0);
  return total >= 20 ? Math.round((((ratings.love ?? 0) + (ratings.like ?? 0)) / total) * 100) : null;
}

