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

