/* Query Client */
import { MutationCache, QueryCache, QueryClient, type QueryKey } from "@tanstack/react-query";

import { ApiError, isServerError } from "./services/api/error";
import { notify } from "./notices";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError | Error;
    queryMeta: {
      /** What to call this data in a "couldn't refresh" notice. */
      label?: string;
    };
    mutationMeta: {
      /** Keys to refresh once the mutation succeeds; see MutationCache below. */
      invalidates?: readonly QueryKey[];
    };
  }
}

const DAY = 24 * 60 * 60 * 1000;

/** The one cache for the stream site (docs/07-state-management.md). */
export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data === undefined) return;
      notify(`Couldn't refresh ${query.meta?.label ?? "this page"}. Showing what we had.`);
      if (import.meta.env.DEV) console.warn(error);
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const keys = mutation.meta?.invalidates ?? [];
      return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: DAY,
      refetchOnWindowFocus: false,
      retry: (count, error) => isServerError(error) && count < 2,
      // Server failures on a first load reach RouteError; a 4xx (an unknown
      // title) is handled by the page.
      throwOnError: (error, query) =>
        query.state.data === undefined && error instanceof ApiError && error.status >= 500,
    },
  },
});

export { DAY };
