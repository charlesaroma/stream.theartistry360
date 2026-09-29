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

/** The member's data: download it, or clear what they've watched. */
export function useAccountData() {
  const memberId = useMemberId();
  const clearHistory = useMutation({ mutationFn: () => account.clearHistory(memberId!), meta: { invalidates: [[...memberRoot(memberId)]], handlesErrors: true } });
  return { clearHistory: clearHistory.mutateAsync, exportData: account.exportData };
}
