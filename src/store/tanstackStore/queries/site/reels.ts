/* Reels Queries */
import { queryOptions, skipToken } from "@tanstack/react-query";

import { getReel, listReels } from "../../services/reelsApi";
import { siteRoot } from "../keys";

export const reelsQueries = {
  all: () => [...siteRoot, "reels"] as const,
  list: () =>
    queryOptions({
      queryKey: [...reelsQueries.all(), "list"] as const,
      queryFn: ({ signal }) => listReels({ signal }),
      meta: { label: "reels" },
    }),
  reel: (id: string | undefined) =>
    queryOptions({
      queryKey: [...reelsQueries.all(), "detail", id] as const,
      queryFn: id ? ({ signal }) => getReel(id, { signal }) : skipToken,
      retry: false,
      meta: { label: "this reel" },
    }),
};
