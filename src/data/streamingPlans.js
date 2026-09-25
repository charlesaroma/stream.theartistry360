// Subscription plans and a sample of subscribers (MOU 3D). Prices are
// placeholders until The Artistry360 confirms pricing in Phase 1 (MOU 8.1).
export const streamingPlansSeed = [
  {
    id: "plan_monthly",
    name: "Monthly",
    priceUGX: 20000,
    interval: "month",
    benefits: ["Every film and replay", "No ads", "HD streaming", "Watch on web and the app"],
    active: true,
    highlight: true,
  },
  {
    id: "plan_quarterly",
    name: "3 Months",
    priceUGX: 55000,
    interval: "quarter",
    benefits: ["Everything in Monthly", "Save 8%"],
    active: true,
    highlight: false,
  },
  {
    id: "plan_yearly",
    name: "Yearly",
    priceUGX: 200000,
    interval: "year",
    benefits: ["Everything in Monthly", "Two months free"],
    active: true,
    highlight: false,
  },
];

export const subscribersSeed = [
  { id: "sub_01", name: "Nakato Grace", email: "grace.n@example.com", planId: "plan_monthly", status: "active", method: "MTN MoMo", renewsAt: "2026-10-12" },
  { id: "sub_02", name: "Okello David", email: "d.okello@example.com", planId: "plan_yearly", status: "active", method: "Card", renewsAt: "2027-03-02" },
  { id: "sub_03", name: "Atim Joan", email: "joan.atim@example.com", planId: "plan_monthly", status: "past_due", method: "Airtel Money", renewsAt: "2026-09-20" },
  { id: "sub_04", name: "Ssemakula Ivan", email: "ivan.s@example.com", planId: "plan_quarterly", status: "active", method: "MTN MoMo", renewsAt: "2026-11-30" },
  { id: "sub_05", name: "Namugga Sarah", email: "sarah.n@example.com", planId: "plan_monthly", status: "cancelled", method: "Card", renewsAt: "2026-09-01" },
];
