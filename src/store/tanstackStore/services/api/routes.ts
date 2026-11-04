/* Api Route Map */

/**
 * Where each backend module mounts, agreed before the module exists so a
 * service is written against the same path the API will serve. Taken from the
 * MOU scope (A360-RTH-MOU-2026-01, clause 3). Nothing answers on these yet;
 * every service still runs on mocks.
 */
export const API_NAMESPACES = {
  identity: "auth",
  content: "content", // pages, programmes, events, news, team
  gallery: "gallery",
  talent: "talent",
  voting: "voting", // campaigns, contestants, votes
  organisers: "organisers",
  payments: "payments", // PesaPal orders and IPN
  enquiries: "enquiries",
  media: "media",
  analytics: "analytics",
};

/**
 * Live endpoints (server/src/api/v1/routes). With VITE_API_MOCKS=false every
 * service uses these; with mocks on, they're never called.
 */
export const routes = {
  health: "health",
  // Sign-in: Google and Apple only (the provider vouches for the member).
  memberGoogle: "auth/google",
  memberApple: "auth/apple",
  memberRefresh: "auth/refresh",
  memberLogout: "auth/logout",
  me: "auth/me",
  deleteAccount: "auth/me/delete",
  signOutEverywhere: "auth/sessions/revoke-all",
  // Catalogue and site
  titles: "streaming/titles",
  types: "streaming/types",
  categories: "streaming/categories",
  plans: "streaming/plans",
  site: "stream/site",
  ads: "stream/ads",
  charges: "payments/charges",
  playback: "streaming/playback",
  // The member's own
  library: "library",
  access: "library/access",
  watchlist: "library/watchlist",
  ratings: "library/ratings",
  progress: "library/progress",
  episodeProgress: "library/episode-progress",
  commentLikes: "library/comment-likes",
  // Payments (PesaPal)
  orders: "payments/orders",
  paymentHistory: "payments/history",
  cancelPlan: "payments/subscription/cancel",
  resumePlan: "payments/subscription/resume",
};
