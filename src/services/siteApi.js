/* Stream Site Settings Service */
// The Studio's Streaming › Stream Site document (GET stream/site).
import { mockApi } from "@/api/mock";
import { streamSiteSeed } from "@/data/streamSite";
import { streamingPlansSeed } from "@/data/streamingPlans";

export const getSite = () => mockApi(() => streamSiteSeed, 100);
export const listPlans = () => mockApi(() => streamingPlansSeed.filter((p) => p.active), 100);
