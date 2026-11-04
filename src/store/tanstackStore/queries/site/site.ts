/* Stream Site Settings Queries */
import { queryOptions } from "@tanstack/react-query";

import { getAds, getChargeRates, getSite, listPlans } from "../../services/siteApi";
import { siteRoot } from "../keys";

export const siteQueries = {
  // Studio › Streaming › Stream Site: hero, rows, announcement, WhatsApp links.
  settings: () =>
    queryOptions({ queryKey: [...siteRoot, "stream-site"] as const, queryFn: ({ signal }) => getSite({ signal }), meta: { label: "the home page" } }),
  // Studio › Streaming › Ads: the web's ad tag and how often free viewers see one.
  ads: () => queryOptions({ queryKey: [...siteRoot, "ads"] as const, queryFn: ({ signal }) => getAds({ signal }), meta: { label: "ads" } }),
  plans: () =>
    queryOptions({ queryKey: [...siteRoot, "plans"] as const, queryFn: ({ signal }) => listPlans({ signal }), meta: { label: "plans" } }),
  // PesaPal's fee and system maintenance, added on top of every price.
  charges: () =>
    queryOptions({ queryKey: [...siteRoot, "charges"] as const, queryFn: ({ signal }) => getChargeRates({ signal }), staleTime: 10 * 60_000, meta: { label: "charges" } }),
};
