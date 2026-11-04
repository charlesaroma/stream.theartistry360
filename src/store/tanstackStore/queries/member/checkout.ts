/* Checkout Window Query */
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";

import { getOrder } from "../../services/accountApi";
import { useMockApi } from "../../services/api/config";

// Every 3 seconds for up to 5 minutes: approving mobile money on a phone takes a while.
const EVERY_MS = 3000;
const MAX_CHECKS = 100;

/**
 * The order being paid in the PesaPal window, asked about every few seconds
 * until PesaPal has answered (which also catches a payment approved on the
 * phone or finished in another tab). Only the API's answer counts: it asks
 * PesaPal. `recheck` asks at once (the return page in the frame says done).
 */
export function useCheckoutOrder(reference: string | null | undefined) {
  const queryKey = ["checkout", reference] as const;
  const query = useQuery({
    queryKey,
    queryFn: reference && !useMockApi ? () => getOrder(reference) : skipToken,
    staleTime: 0,
    gcTime: 0,
    retry: 2,
    refetchInterval: (q) => (q.state.data?.status === "pending" && q.state.dataUpdateCount < MAX_CHECKS ? EVERY_MS : false),
  });
  // How many answers have come back; each one re-renders, so this stays current.
  const checks = useQueryClient().getQueryState(queryKey)?.dataUpdateCount ?? 0;
  const pending = !query.data || query.data.status === "pending";
  return { order: query.data, gaveUp: pending && checks >= MAX_CHECKS, recheck: query.refetch };
}
