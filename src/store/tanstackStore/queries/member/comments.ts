/* Comments Queries */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import type { Id } from "../../services/api/types";
import * as comments from "../../services/commentsApi";
import type { Member } from "../../services/types";
import { useMember } from "@/store/context/MemberContext";
import { memberRoot } from "../keys";

// Comments are public but change constantly, so they live outside the
// persisted "site" realm: ["comments", titleId]. The member's likes are theirs.
export const commentQueries = {
  list: (titleId: Id) =>
    queryOptions({
      queryKey: ["comments", titleId] as const,
      queryFn: ({ signal }) => comments.listComments(titleId, { signal }),
      staleTime: 30_000,
      meta: { label: "comments" },
    }),
  liked: (memberId: Id | null | undefined) =>
    queryOptions({
      queryKey: [...memberRoot(memberId), "comment-likes"] as const,
      queryFn: ({ signal }) => comments.likedComments(memberId, { signal }),
    }),
};

/** A title's comments, the member's likes, and the actions on them. */
export function useComments(titleId: Id) {
  const member = (useMember() as { member: Member | null }).member;
  const list = useQuery(commentQueries.list(titleId));
  const liked = useQuery(commentQueries.liked(member?.id));
  const meta = { invalidates: [commentQueries.list(titleId).queryKey, commentQueries.liked(member?.id).queryKey], handlesErrors: true };

  const post = useMutation({ mutationFn: (v: { body: string; spoiler: boolean }) => comments.postComment(member, titleId, v), meta });
  const remove = useMutation({ mutationFn: (id: Id) => comments.deleteComment(member, titleId, id), meta });
  const like = useMutation({ mutationFn: (id: Id) => comments.toggleLike(member, titleId, id), meta });
  const report = useMutation({ mutationFn: (id: Id) => comments.reportComment(member, titleId, id), meta: { handlesErrors: true } });

  return {
    member,
    items: list.data ?? [],
    isLoading: list.isLoading,
    liked: new Set(liked.data ?? []),
    post: post.mutateAsync,
    posting: post.isPending,
    remove: remove.mutateAsync,
    like: like.mutate,
    report: report.mutateAsync,
  };
}

export { COMMENT_MAX } from "../../services/commentsApi";
