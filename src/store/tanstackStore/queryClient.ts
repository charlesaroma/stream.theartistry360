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
      /**
       * The caller shows its own error (a form's inline message), or the write
       * is a quiet background save; skip the app-wide notice.
       */
      handlesErrors?: boolean;
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
    // One place for write failures: unless the caller shows its own message,
    // say what went wrong (ApiError messages are written for people). A form
    // stays open with its values, so trying again costs nothing.
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.handlesErrors) return;
      notify(error instanceof ApiError && error.message ? error.message : "That didn't save. Check your connection and try again.");
      if (import.meta.env.DEV) console.warn(error);
    },
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
