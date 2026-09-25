/* Catalogue Hooks */
import { useQuery } from "@tanstack/react-query";

import { getTitle, listCategories, listTitles, listTypes, searchTitles } from "@/services/catalogApi";
import { getSite, listPlans } from "@/services/siteApi";

export const useTitles = () => useQuery({ queryKey: ["titles"], queryFn: listTitles });
export const useTitle = (id) => useQuery({ queryKey: ["titles", id], queryFn: () => getTitle(id), enabled: Boolean(id), retry: false });
export const useSearch = (q) => useQuery({ queryKey: ["search", q], queryFn: () => searchTitles(q), enabled: q.trim().length > 1 });
export const useTypes = () => useQuery({ queryKey: ["types"], queryFn: listTypes, staleTime: Infinity });
export const useCategories = () => useQuery({ queryKey: ["categories"], queryFn: listCategories, staleTime: Infinity });
export const useSite = () => useQuery({ queryKey: ["site"], queryFn: getSite });
export const usePlans = () => useQuery({ queryKey: ["plans"], queryFn: listPlans });

/** id -> name lookups for types and categories. */
export function useTaxonomy() {
  const { data: types = [] } = useTypes();
  const { data: categories = [] } = useCategories();
  return {
    typeName: (id) => types.find((t) => t.id === id)?.name ?? "",
    categoryName: (id) => categories.find((c) => c.id === id)?.name ?? "",
    types,
    categories,
  };
}
