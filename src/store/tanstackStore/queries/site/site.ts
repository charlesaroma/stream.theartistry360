/* Stream Site Settings Queries */
import { queryOptions } from "@tanstack/react-query";

import { getSite, listPlans } from "../../services/siteApi";
import { siteRoot } from "../keys";

export const siteQueries = {
  // Studio › Streaming › Stream Site: hero, rows, announcement, WhatsApp links.
  settings: () =>
    queryOptions({ queryKey: [...siteRoot, "stream-site"] as const, queryFn: ({ signal }) => getSite({ signal }), meta: { label: "the home page" } }),
  plans: () =>
    queryOptions({ queryKey: [...siteRoot, "plans"] as const, queryFn: ({ signal }) => listPlans({ signal }), meta: { label: "plans" } }),
};
