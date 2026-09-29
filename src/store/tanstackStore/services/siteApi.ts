/* Stream Site Settings Service */
// The Studio's Streaming › Stream Site document (GET stream/site) and the
// plans on sale (Streaming › Subscriptions).
import { mockApi } from "@/store/tanstackStore/services/api/mock";
import type { RequestOptions } from "@/store/tanstackStore/services/api/types";
import type { Plan, StreamSite } from "./types";
import { streamSiteSeed } from "@/data/streamSite";
import { streamingPlansSeed } from "@/data/streamingPlans";

export const getSite = ({ signal }: RequestOptions = {}) => mockApi(() => streamSiteSeed as StreamSite, 100, signal);
export const listPlans = ({ signal }: RequestOptions = {}) =>
  mockApi(() => (streamingPlansSeed as Plan[]).filter((p) => p.active), 100, signal);
