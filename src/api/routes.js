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

/** Live endpoints. Everything absent from here is still a mock. */
export const routes = {
  health: "health",
};
