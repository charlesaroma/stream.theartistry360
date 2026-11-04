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
import { streamingPlansSeed } from "@/data/streamingPlans";

export const getSite = ({ signal }: RequestOptions = {}) =>
  !useMockApi ? http.get<StreamSite>(routes.site, { signal }) : mockApi(() => streamSiteSeed as StreamSite, 100, signal);
// Live: active plans only, in the Studio's order.
export const listPlans = ({ signal }: RequestOptions = {}) =>
  !useMockApi ? http.get<Plan[]>(routes.plans, { signal }) : mockApi(() => (streamingPlansSeed as Plan[]).filter((p) => p.active), 100, signal);
