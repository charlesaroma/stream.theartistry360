/* Access Rules */
// MOU 3D: free tier (signed in, with ads), subscription, or pay-per-view.

export function accessFor(title, member) {
  const tier = title?.access?.tier;
  if (tier === "free") return member ? { ok: true, ads: true } : { ok: false, reason: "signin" };
  if (!member) return { ok: false, reason: "signin" };
  if (tier === "subscription") return member.subscription?.status === "active" ? { ok: true } : { ok: false, reason: "subscribe" };
  if (tier === "ppv") return member.purchases?.includes(title.id) ? { ok: true } : { ok: false, reason: "buy" };
  return { ok: false, reason: "signin" };
}

export const TIER_LABEL = { free: "Free", subscription: "Subscribers", ppv: "Pay-per-view" };

/** "94% liked it": Love this! and I like this, over every rating. */
export function likedPercent(ratings) {
  if (!ratings) return null;
  const total = (ratings.love ?? 0) + (ratings.like ?? 0) + (ratings.meh ?? 0);
  return total >= 20 ? Math.round((((ratings.love ?? 0) + (ratings.like ?? 0)) / total) * 100) : null;
}

/**
 * The label on a card, depending on who is looking:
 * - signed out, or not entitled: Free, Subscribers, or the price;
 * - a subscriber: "Included" on subscription titles, nothing on free ones;
 * - someone who bought it: "Owned".
 * `kind` picks the icon; null means show nothing.
 */
export function accessLabel(title, member) {
  const tier = title?.access?.tier;
  const subscribed = member?.subscription?.status === "active";
  if (tier === "ppv") {
    return member?.purchases?.includes(title.id)
      ? { kind: "owned", text: "Owned" }
      : { kind: "price", text: `UGX ${Number(title.access.priceUGX ?? 0).toLocaleString("en-UG")}` };
  }
  if (tier === "subscription") return subscribed ? { kind: "included", text: "Included" } : { kind: "subscribers", text: "Subscribers" };
  if (tier === "free") return subscribed ? null : { kind: "free", text: "Free" };
  return null;
}
