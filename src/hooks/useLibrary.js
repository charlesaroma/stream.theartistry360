/* Member Library Hooks */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useMember } from "@/context/MemberContext";
import { getProgress, getWatchlist, saveProgress, toggleWatchlist } from "@/services/libraryApi";

export function useWatchlist() {
  const { member } = useMember();
  const qc = useQueryClient();
  const key = ["watchlist", member?.id ?? "guest"];
  const { data: list = [] } = useQuery({ queryKey: key, queryFn: () => getWatchlist(member?.id) });
  const toggle = useMutation({
    mutationFn: (titleId) => toggleWatchlist(member?.id, titleId),
    onSuccess: (next) => qc.setQueryData(key, next),
  });
  return { list, has: (id) => list.includes(id), toggle: toggle.mutate };
}

export function useProgress() {
  const { member } = useMember();
  const qc = useQueryClient();
  const key = ["progress", member?.id ?? "guest"];
  const { data: progress = {} } = useQuery({ queryKey: key, queryFn: () => getProgress(member?.id) });
  const save = useMutation({
    mutationFn: ({ titleId, seconds, duration }) => saveProgress(member?.id, titleId, seconds, duration),
    onSuccess: (next) => qc.setQueryData(key, next),
  });
  return { progress, save: save.mutate };
}
