/* Account Queries */
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Id } from "../../services/api/types";
import * as account from "../../services/accountApi";
import type { Member, MemberSettings } from "../../services/types";
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
  settings: (memberId: Id | undefined) =>
    queryOptions({
      queryKey: [...memberRoot(memberId), "settings"] as const,
      queryFn: ({ signal }) => account.getSettings(memberId!, { signal }),
      enabled: Boolean(memberId),
      meta: { label: "your settings" },
    }),
};

const useMemberId = () => (useMember() as { member: Member | null }).member?.id;

export function usePayments() {
  return useQuery(accountQueries.payments(useMemberId()));
}

/** Settings plus their writes; errors are shown in the page. */
export function useAccountSettings() {
  const memberId = useMemberId();
  const options = accountQueries.settings(memberId);
  const query = useQuery(options);
  const meta = { invalidates: [options.queryKey], handlesErrors: true };
  const qc = useQueryClient();
  // Switches answer at once: the choice shows before the save lands, and
  // goes back if it fails.
  const notifications = useMutation({
    mutationFn: (patch: Partial<MemberSettings["notifications"]>) => account.updateNotifications(memberId!, patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: options.queryKey });
      const previous = qc.getQueryData<MemberSettings>(options.queryKey);
      if (previous) qc.setQueryData(options.queryKey, { ...previous, notifications: { ...previous.notifications, ...patch } });
      return { previous };
    },
    onError: (_e, _patch, ctx) => ctx?.previous && qc.setQueryData(options.queryKey, ctx.previous),
    meta,
  });
  const clearHistory = useMutation({ mutationFn: () => account.clearHistory(memberId!), meta: { invalidates: [[...memberRoot(memberId)]], handlesErrors: true } });
  return {
    settings: query.data ?? account.DEFAULT_SETTINGS,
    isLoading: query.isLoading,
    saveNotifications: notifications.mutateAsync,
    clearHistory: clearHistory.mutateAsync,
    exportData: account.exportData,
  };
}
