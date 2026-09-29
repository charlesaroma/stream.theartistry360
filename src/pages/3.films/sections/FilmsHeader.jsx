/* Films Header */
import { Search, X } from "lucide-react";

import BrowseHeader from "@/components/layout/BrowseHeader";
import { SORTS } from "@/utils/catalog";

/** "Films", a search box for this page, and the sort, on one line. */
export default function FilmsHeader({ query, onQuery, sort, onSort, showSort }) {
  return (
    <BrowseHeader
      title="Films"
      actions={
        <>
          <label className="relative flex min-w-0 items-center">
            <span className="sr-only">Search films</span>
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search titles, cast, crew"
              className="min-h-11 w-[min(20rem,70vw)] rounded-full border border-border-subtle bg-surface-card pl-10 pr-10 text-small text-text-primary placeholder:text-text-muted focus-visible:border-brand focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => onQuery("")} aria-label="Clear search" className="absolute right-1 grid h-9 w-9 place-items-center rounded-full text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </label>
          {showSort && (
            <label className="flex items-center gap-2 text-small text-text-muted">
              <span className="sr-only sm:not-sr-only">Sort</span>
              <select value={sort} onChange={(e) => onSort(e.target.value)} className="min-h-11 rounded-full border border-border-subtle bg-surface-card px-4 text-small text-text-primary">
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          )}
        </>
      }
    />
  );
}
