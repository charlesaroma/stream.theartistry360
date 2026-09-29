/* Comments */
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Flag, Heart, MessageCircle, Trash2 } from "lucide-react";

import { COMMENT_MAX, useComments } from "@/store/tanstackStore/queries/member";
import { cn } from "@/utils/cn";

const since = (iso) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const units = [[31536000, "y"], [2592000, "mo"], [604800, "w"], [86400, "d"], [3600, "h"], [60, "m"]];
  const [size, u] = units.find(([n]) => s >= n);
  return `${Math.floor(s / size)}${u} ago`;
};

/**
 * Members talk about a title. Everyone can read; signing in lets you post
 * (500 characters, optional spoiler cover), like, delete your own, or report
 * one for the team to review. Bodies render as plain text, never HTML.
 */
export default function Comments({ titleId, className }) {
  const c = useComments(titleId);
  const { pathname, search } = useLocation();
  const [sort, setSort] = useState("top");
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(() => new Set());
  const [reported, setReported] = useState(() => new Set());

  const items = useMemo(
    () => [...c.items].sort((a, b) => (sort === "top" ? b.likes - a.likes || b.createdAt.localeCompare(a.createdAt) : b.createdAt.localeCompare(a.createdAt))),
    [c.items, sort],
  );

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await c.post({ body, spoiler });
      setBody("");
      setSpoiler(false);
      setSort("new");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section aria-labelledby="comments-heading" className={className}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="comments-heading" className="text-heading">
          Comments <span className="text-text-muted tabular-nums">{c.items.length}</span>
        </h2>
        <div role="tablist" aria-label="Sort comments" className="flex rounded-full border border-white/10 p-1">
          {[["top", "Top"], ["new", "Newest"]].map(([v, label]) => (
            <button key={v} type="button" role="tab" aria-selected={sort === v} onClick={() => setSort(v)} className={cn("min-h-9 rounded-full px-4 text-small font-semibold transition-colors", sort === v ? "bg-white/12 text-text-primary" : "text-text-muted hover:text-text-primary")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      {c.member ? (
        <form onSubmit={submit} className="mb-8 flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-bold text-black" aria-hidden="true">{c.member.name.charAt(0).toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <label htmlFor="comment-body" className="sr-only">Add a comment</label>
            <textarea
              id="comment-body"
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, COMMENT_MAX))}
              rows={3}
              placeholder="What did you think? Be kind; no spoilers without the cover."
              className="w-full resize-y rounded-2xl border border-white/10 bg-surface-card px-4 py-3 text-body text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-small text-text-secondary">
                <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} className="h-4 w-4 accent-(--color-brand)" />
                Contains spoilers
              </label>
              <Link to="/legal/community" className="text-caption text-text-muted underline hover:text-brand">Community Guidelines</Link>
              <span className="ml-auto text-caption tabular-nums text-text-muted">{body.length}/{COMMENT_MAX}</span>
              <button type="submit" disabled={!body.trim() || c.posting} className="btn btn-primary min-h-10 px-5 disabled:opacity-50">
                {c.posting ? "Posting…" : "Post"}
              </button>
            </div>
            {error && <p role="alert" className="mt-2 text-small font-semibold text-danger">{error}</p>}
          </div>
        </form>
      ) : (
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-white/15 p-5">
          <MessageCircle className="h-5 w-5 text-text-muted" aria-hidden="true" />
          <p className="flex-1 text-small text-text-secondary">Sign in to join the conversation.</p>
          <Link to={`/sign-in?next=${encodeURIComponent(pathname + search)}`} viewTransition className="btn btn-primary min-h-10 px-5">Sign in</Link>
        </div>
      )}

      {/* List */}
      {items.length === 0 && !c.isLoading && <p className="text-small text-text-muted">No comments yet. Be the first.</p>}
      <ul className="flex flex-col gap-5">
        {items.map((m) => {
          const mine = c.member?.id === m.author.id;
          const hidden = m.spoiler && !revealed.has(m.id);
          const liked = c.liked.has(m.id);
          return (
            <li key={m.id} className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 font-bold text-text-secondary" aria-hidden="true">{m.author.name.charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="text-small">
                  <span className="font-semibold text-text-primary">{m.author.name}</span>
                  {mine && <span className="ml-2 rounded bg-brand/15 px-1.5 text-caption font-bold text-brand">You</span>}
                  <span className="ml-2 text-text-muted">{since(m.createdAt)}</span>
                </p>
                {hidden ? (
                  <button type="button" onClick={() => setRevealed((s) => new Set(s).add(m.id))} className="mt-1 rounded-xl bg-white/6 px-3 py-2 text-small font-semibold text-text-secondary hover:bg-white/10">
                    Spoiler hidden · Show
                  </button>
                ) : (
                  <p className="mt-1 whitespace-pre-line break-words text-body text-text-secondary">{m.body}</p>
                )}
                <div className="mt-2 flex items-center gap-1 text-caption text-text-muted">
                  <button
                    type="button"
                    onClick={() => (c.member ? c.like(m.id) : setError("Sign in to like comments."))}
                    aria-pressed={liked}
                    aria-label={`${liked ? "Unlike" : "Like"} comment by ${m.author.name}`}
                    className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 font-semibold transition-colors hover:bg-white/8", liked && "text-brand")}
                  >
                    <Heart className={cn("h-4 w-4", liked && "fill-current")} aria-hidden="true" /> {m.likes}
                  </button>
                  {mine ? (
                    <button type="button" onClick={() => c.remove(m.id)} aria-label="Delete your comment" className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 font-semibold hover:bg-white/8 hover:text-danger">
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                    </button>
                  ) : c.member && (
                    <button
                      type="button"
                      disabled={reported.has(m.id)}
                      onClick={async () => { await c.report(m.id); setReported((s) => new Set(s).add(m.id)); }}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 font-semibold hover:bg-white/8 disabled:opacity-60"
                    >
                      <Flag className="h-4 w-4" aria-hidden="true" /> {reported.has(m.id) ? "Reported, thanks" : "Report"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
