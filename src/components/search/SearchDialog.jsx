/* Search Dialog */
import { useDeferredValue, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CornerDownLeft, History, Search, TrendingUp, X } from "lucide-react";

import MetaLine from "@/components/title/MetaLine";
import { useSearch, useTitles } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { useRecentSearches } from "./useRecentSearches";

/**
 * Quick search, over whatever page you're on. Results arrive as you type;
 * ↑/↓ move, Enter opens the highlighted title, and Enter with nothing
 * highlighted opens the full /search page.
 */
export default function SearchDialog({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listId = useId();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(-1);
  const deferred = useDeferredValue(q);
  const { data: results = [], isFetching } = useSearch(deferred);
  const { data: titles = [] } = useTitles();
  const { recent, remember, clear } = useRecentSearches();
  const searching = deferred.trim().length > 1;
  const trending = [...titles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  const items = searching ? results.slice(0, 6) : trending;

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const go = (path) => {
    onClose();
    navigate(path, { viewTransition: true });
  };
  const openTitle = (t) => {
    if (searching) remember(q);
    go(`/title/${t.id}`);
  };
  const openAll = (term = q) => {
    if (term.trim().length < 2) return;
    remember(term);
    go(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) openTitle(items[active]);
      else openAll();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-100 flex justify-center px-4 pt-[min(12vh,7rem)]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 animate-fade bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        data-glass=""
        className="molten-glass relative flex max-h-[min(80vh,40rem)] w-full max-w-2xl animate-rise flex-col overflow-hidden rounded-3xl bg-surface-elevated/85"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5">
          <Search className="h-5 w-5 shrink-0 text-text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(-1); }}
            placeholder="Search titles, actors, directors…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            className="min-h-16 flex-1 bg-transparent text-lead text-text-primary placeholder:text-text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Clear search" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-text-muted hover:text-text-primary">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          <kbd className="hidden rounded-md border border-white/15 px-2 py-1 text-caption text-text-muted sm:block">Esc</kbd>
        </div>

        <div className="overflow-y-auto p-3">
          {/* Recent searches */}
          {!searching && recent.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-caption font-bold uppercase tracking-[0.18em] text-text-muted">Recent</p>
                <button type="button" onClick={clear} className="min-h-9 cursor-pointer px-2 text-caption text-text-muted hover:text-text-primary">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2 px-3">
                {recent.map((r) => (
                  <button key={r} type="button" onClick={() => { setQ(r); inputRef.current?.focus(); }} className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 text-small text-text-secondary hover:border-white/30 hover:text-text-primary">
                    <History className="h-3.5 w-3.5" aria-hidden="true" /> {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="flex items-center gap-2 px-3 py-2 text-caption font-bold uppercase tracking-[0.18em] text-text-muted" aria-live="polite">
            {searching ? (
              isFetching ? "Searching…" : `${results.length} ${results.length === 1 ? "result" : "results"}`
            ) : (
              <><TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Trending now</>
            )}
          </p>

          <ul id={listId} role="listbox" aria-label={searching ? "Results" : "Trending"}>
            {items.map((t, i) => (
              <li
                key={t.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onPointerEnter={() => setActive(i)}
                onClick={() => openTitle(t)}
                className={cn("flex cursor-pointer items-center gap-4 rounded-2xl p-2 transition-colors", i === active ? "bg-white/10" : "hover:bg-white/5")}
              >
                <img src={t.poster} alt="" className="h-18 w-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-text-primary">{t.title}</p>
                  <MetaLine title={t} className="text-caption" />
                </div>
                {i === active && <CornerDownLeft className="mr-2 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />}
              </li>
            ))}
          </ul>

          {searching && !isFetching && results.length === 0 && (
            <p className="px-3 py-8 text-center text-body text-text-muted">Nothing found for “{deferred}”. Try an actor’s name or a genre.</p>
          )}
        </div>

        {searching && results.length > 0 && (
          <button type="button" onClick={() => openAll()} className="flex min-h-14 cursor-pointer items-center justify-between border-t border-white/10 px-6 text-small font-semibold text-brand hover:bg-white/5">
            See all results for “{q.trim()}” <span className="flex items-center gap-2 text-caption text-text-muted">Enter <ArrowRight className="h-4 w-4 text-brand" aria-hidden="true" /></span>
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
