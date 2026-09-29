/* Site Queries */
// Public reads: the catalogue and what the Studio configured. Anyone may see
// them, so they are persisted (persist.ts).
import { useQuery, type QueryClient } from "@tanstack/react-query";

import { catalogQueries } from "./catalog";
import { siteQueries } from "./site";

export const useTitles = () => useQuery(catalogQueries.titles());
export const useTitle = (id?: string) => useQuery(catalogQueries.title(id));
export const useSearch = (q: string) => useQuery(catalogQueries.search(q));
export const useTypes = () => useQuery(catalogQueries.types());
export const useCategories = () => useQuery(catalogQueries.categories());
export const useSite = () => useQuery(siteQueries.settings());
export const usePlans = () => useQuery(siteQueries.plans());

/** id -> name lookups for types and categories. */
export function useTaxonomy() {
  const { data: types = [] } = useTypes();
  const { data: categories = [] } = useCategories();
  return {
    typeName: (id: string) => types.find((t) => t.id === id)?.name ?? "",
    categoryName: (id: string) => categories.find((c) => c.id === id)?.name ?? "",
    types,
    categories,
  };
}

/** Hover or focus on a card warms its title page. Failures show on the page if they recur. */
export function prefetchTitle(queryClient: QueryClient, id: string) {
  queryClient.query(catalogQueries.title(id)).catch(() => {});
}

export { catalogQueries, siteQueries };
