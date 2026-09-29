/* Catalogue Queries */
import { queryOptions, skipToken } from "@tanstack/react-query";

import { getTitle, listCategories, listTitles, listTypes, searchTitles } from "../../services/catalogApi";
import { siteRoot } from "../keys";

export const catalogQueries = {
  all: () => [...siteRoot, "titles"] as const,
  titles: () =>
    queryOptions({
      queryKey: [...catalogQueries.all(), "list"] as const,
      queryFn: ({ signal }) => listTitles({ signal }),
      meta: { label: "the catalogue" },
    }),
  // An unknown or unpublished id is a 404 the page handles, not a retry.
  title: (id: string | undefined) =>
    queryOptions({
      queryKey: [...catalogQueries.all(), "detail", id] as const,
      queryFn: id ? ({ signal }) => getTitle(id, { signal }) : skipToken,
      retry: false,
      meta: { label: "this title" },
    }),
  // Waits for two characters; each keystroke cancels the last request.
  search: (q: string) =>
    queryOptions({
      queryKey: [...catalogQueries.all(), "search", q.trim().toLowerCase()] as const,
      queryFn: q.trim().length > 1 ? ({ signal }) => searchTitles(q, { signal }) : skipToken,
      meta: { label: "search results" },
    }),
  // Change only when the Studio edits them; a mutation or a live event
  // invalidates them. Infinity, not "static": static queries ignore
  // invalidateQueries.
  types: () =>
    queryOptions({
      queryKey: [...siteRoot, "types"] as const,
      queryFn: ({ signal }) => listTypes({ signal }),
      staleTime: Infinity,
    }),
  categories: () =>
    queryOptions({
      queryKey: [...siteRoot, "categories"] as const,
      queryFn: ({ signal }) => listCategories({ signal }),
      staleTime: Infinity,
    }),
};
