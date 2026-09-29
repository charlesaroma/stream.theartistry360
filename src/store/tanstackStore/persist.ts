/* Query Cache Persistence */
import { defaultShouldDehydrateQuery } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { PersistQueryClientProviderProps } from "@tanstack/react-query-persist-client";

import { DAY } from "./queryClient";

/**
 * Public reads survive a reload and a weak connection: home and Films open on
 * what a visitor saw last while they refetch. Only ["site", …] is written;
 * a member's library is personal and is never put in this storage.
 */
const persister = createAsyncStoragePersister({
  storage: typeof window === "undefined" ? undefined : window.localStorage,
  key: "a360s:query-cache",
  throttleTime: 2000,
});

export const persistOptions: PersistQueryClientProviderProps["persistOptions"] = {
  persister,
  maxAge: DAY,
  buster: __APP_BUILD__,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) && query.queryKey[0] === "site",
  },
};
