/* Stream Site Settings Service */
// The Studio's Streaming › Stream Site document (GET stream/site) and the
// plans on sale (Streaming › Subscriptions).
import { http } from "@/store/tanstackStore/services/api/client";
import { useMockApi } from "@/store/tanstackStore/services/api/config";
import { routes } from "@/store/tanstackStore/services/api/routes";
import { mockApi } from "@/store/tanstackStore/services/api/mock";
import type { RequestOptions } from "@/store/tanstackStore/services/api/types";
import type { Plan, StreamSite } from "./types";
import { streamSiteSeed } from "@/data/streamSite";
import { DEFAULT_RATES } from "@/utils/charges";
import { streamingPlansSeed } from "@/data/streamingPlans";

export const getSite = ({ signal }: RequestOptions = {}) =>
  !useMockApi ? http.get<StreamSite>(routes.site, { signal }) : mockApi(() => streamSiteSeed as StreamSite, 100, signal);
// Live: active plans only, in the Studio's order.
export const listPlans = ({ signal }: RequestOptions = {}) =>
  !useMockApi ? http.get<Plan[]>(routes.plans, { signal }) : mockApi(() => (streamingPlansSeed as Plan[]).filter((p) => p.active), 100, signal);

/** What the player needs to show free viewers ads (Studio › Streaming › Ads): `GET stream/ads`. */
export interface AdSettings {
  enabled: boolean;
  frequencyCapPerHour: number;
  web: { adTagUrl: string; preroll: boolean; midrollEveryMinutes: number; skippableAfterSeconds: number };
}

export const getAds = ({ signal }: RequestOptions = {}) =>
  !useMockApi
    ? http.get<AdSettings>(routes.ads, { signal })
    : mockApi((): AdSettings => ({ enabled: true, frequencyCapPerHour: 4, web: { adTagUrl: "", preroll: true, midrollEveryMinutes: 15, skippableAfterSeconds: 5 } }), 0, signal);

/** The charges added on top of every price (PesaPal's fee and system maintenance), to show the total before paying. */
export interface ChargeRates {
  pesapalPercent: number;
  maintenancePercent: number;
}
export const getChargeRates = ({ signal }: RequestOptions = {}) =>
  !useMockApi ? http.get<ChargeRates>(routes.charges, { signal }) : mockApi((): ChargeRates => DEFAULT_RATES, 50, signal);
