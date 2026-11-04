/* Comments Service */
// Members discuss a title. Reading is public; posting, liking, deleting and
// reporting need a signed-in member. Live: streaming/titles/:id/comments,
// which takes the author from the session (never the request), caps length,
// strips control characters, limits how fast a member posts, and hides a
// comment three members reported until the Studio looks at it. The mock
// keeps comments in this browser (seeded with samples). The page renders
// bodies as plain text only.
import { http } from "@/store/tanstackStore/services/api/client";
import { useMockApi } from "@/store/tanstackStore/services/api/config";
import { routes } from "@/store/tanstackStore/services/api/routes";
import { ApiError, mockApi } from "@/store/tanstackStore/services/api/mock";
import type { Id, RequestOptions } from "@/store/tanstackStore/services/api/types";
import type { Member } from "./types";
import { commentsSeed } from "@/data/comments";

export const COMMENT_MAX = 500;

export interface Comment {
  id: Id;
  author: { id: Id; name: string };
  body: string;
  spoiler: boolean;
  likes: number;
  createdAt: string;
}

const key = (titleId: Id) => `a360s:comments:${titleId}`;
const likedKey = (memberId: Id) => `a360s:comment-likes:${memberId}`;

function read<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, value: T): T {
  try {
    localStorage.setItem(k, JSON.stringify(value));
  } catch {
    // Storage blocked: lasts for this visit.
  }
  return value;
}
const all = (titleId: Id) => read<Comment[]>(key(titleId), (commentsSeed as Record<string, Comment[]>)[titleId] ?? []);

// Control characters out (tab and new lines stay), runs of blank lines
// squeezed, ends trimmed.
const printable = (ch: string) => {
  const c = ch.charCodeAt(0);
  return c === 9 || c === 10 || c === 13 || (c >= 32 && c !== 127);
};
const clean = (text: string) => [...text].filter(printable).join("").replace(/\n{3,}/g, "\n\n").trim();

const commentsOf = (titleId: Id) => `${routes.titles}/${encodeURIComponent(titleId)}/comments`;

export const listComments = (titleId: Id, { signal }: RequestOptions = {}) =>
  !useMockApi ? http.get<Comment[]>(commentsOf(titleId), { signal }) : mockApi(() => all(titleId), 200, signal);

export function postComment(member: Member | null, titleId: Id, { body, spoiler }: { body: string; spoiler: boolean }) {
  if (!useMockApi) {
    if (!member) return Promise.reject(new ApiError("Sign in to comment.", 401));
    return http.post<Comment>(commentsOf(titleId), { body: clean(body ?? ""), spoiler: Boolean(spoiler) });
  }
  return mockApi(() => {
    if (!member) throw new ApiError("Sign in to comment.", 401);
    const text = clean(body ?? "");
    if (!text) throw new ApiError("Write something first.", 422);
    if (text.length > COMMENT_MAX) throw new ApiError(`Keep it under ${COMMENT_MAX} characters.`, 422);
    const comment: Comment = { id: `c_${Date.now().toString(36)}`, author: { id: member.id, name: member.name }, body: text, spoiler: Boolean(spoiler), likes: 0, createdAt: new Date().toISOString() };
    write(key(titleId), [comment, ...all(titleId)]);
    return comment;
  }, 400);
}

export function deleteComment(member: Member | null, titleId: Id, commentId: Id) {
  if (!useMockApi) return http.del(`${commentsOf(titleId)}/${commentId}`);
  return mockApi(() => {
    const list = all(titleId);
    const c = list.find((x) => x.id === commentId);
    if (!member || c?.author.id !== member.id) throw new ApiError("You can only delete your own comments.", 403);
    write(key(titleId), list.filter((x) => x.id !== commentId));
  }, 200);
}

/** Likes: one per member per comment; the set is kept per member. */
export const likedComments = (memberId: Id | null | undefined, { signal }: RequestOptions = {}) =>
  !useMockApi
    ? memberId ? http.get<Id[]>(routes.commentLikes, { signal }) : Promise.resolve([])
    : mockApi(() => (memberId ? read<Id[]>(likedKey(memberId), []) : []), 0, signal);

export function toggleLike(member: Member | null, titleId: Id, commentId: Id) {
  if (!useMockApi) {
    if (!member) return Promise.reject(new ApiError("Sign in to like comments.", 401));
    return http.post<{ liked: boolean; likes: number }>(`${commentsOf(titleId)}/${commentId}/like`).then((r) => r.liked);
  }
  return mockApi(() => {
    if (!member) throw new ApiError("Sign in to like comments.", 401);
    const liked = read<Id[]>(likedKey(member.id), []);
    const on = !liked.includes(commentId);
    write(likedKey(member.id), on ? [...liked, commentId] : liked.filter((x) => x !== commentId));
    write(key(titleId), all(titleId).map((c) => (c.id === commentId ? { ...c, likes: Math.max(0, c.likes + (on ? 1 : -1)) } : c)));
    return on;
  }, 0);
}

/** A report hides nothing in the mock; the API counts it, and three hide the comment for the Studio. */
export const reportComment = (member: Member | null, titleId: Id, commentId: Id) =>
  !useMockApi
    ? member ? http.post<{ reported: true }>(`${commentsOf(titleId)}/${commentId}/report`) : Promise.reject(new ApiError("Sign in to report comments.", 401))
    : mockApi(() => {
    if (!member) throw new ApiError("Sign in to report comments.", 401);
    return { reported: true as const };
  }, 300);
