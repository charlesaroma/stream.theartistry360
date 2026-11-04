/* Account Queries */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import type { Id } from "../../services/api/types";
import * as account from "../../services/accountApi";
import type { Member } from "../../services/types";
import { useMember } from "@/store/context/MemberContext";
import { memberRoot } from "../keys";

export const accountQueries = {
  payments: (memberId: Id | undefined) =>
    queryOptions({
      queryKey: [...memberRoot(memberId), "payments"] as const,
      queryFn: ({ signal }) => account.listPayments(memberId!, { signal }),
      enabled: Boolean(memberId),
      meta: { label: "your payments" },
    }),
};

const useMemberId = () => (useMember() as { member: Member | null }).member?.id;

export function usePayments() {
  return useQuery(accountQueries.payments(useMemberId()));
}

/** Clearing what the member has watched. */
export function useAccountData() {
  const memberId = useMemberId();
  const clearHistory = useMutation({ mutationFn: () => account.clearHistory(memberId!), meta: { invalidates: [[...memberRoot(memberId)]], handlesErrors: true } });
  return { clearHistory: clearHistory.mutateAsync };
}

// The PesaPal return page asks about the order itself (it polls until
// PesaPal has answered), so it gets the plain call, through the store.
export { getOrder, type OrderStatus } from "../../services/accountApi";
export { CHECKOUT_KEY } from "../../services/authApi";
// Sign-in buttons: the providers' own scripts, reached through the store too.
export { memberProviders, preloadApple, renderGoogleButton } from "../../services/identityProviders";
