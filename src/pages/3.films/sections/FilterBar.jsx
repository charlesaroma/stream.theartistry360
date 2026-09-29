/* Films Filter Bar */
import { X } from "lucide-react";

import FilterMenu from "@/components/ui/FilterMenu";
import { ACCESS_OPTIONS, FILM_TABS } from "@/utils/catalog";
import { cn } from "@/utils/cn";

/**
 * One row of filters: type as tabs (scrolling sideways on phones), then
 * Genre and Access as small menus (bottom sheets on phones). Active filters
 * show as removable chips with "Clear all", beside the count.
 */
export default function FilterBar({ tab, onTab, genres, genre, onGenre, access, onAccess, query, onQuery, count, onClear }) {
  const chips = [
    genre && { key: "genre", label: genres.find((g) => g.id === genre)?.name ?? genre, clear: () => onGenre("") },
    access && { key: "access", label: ACCESS_OPTIONS.find((a) => a.id === access)?.label, clear: () => onAccess("") },
    query.trim() && { key: "q", label: `“${query.trim()}”`, clear: () => onQuery("") },
  ].filter(Boolean);

  return (
    <div className="shell flex flex-col gap-3 pb-8">
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Type" className="no-scrollbar -mx-1 flex min-w-0 max-w-full gap-1 overflow-x-auto px-1">
          {FILM_TABS.map((t) => (
            <button
              key={t.id || "all"}
              type="button"
              role="tab"
              aria-selected={tab.id === t.id}
              onClick={() => onTab(t.id)}
              className={cn(
                "relative min-h-11 shrink-0 px-3 text-small font-semibold transition-colors",
                tab.id === t.id ? "text-text-primary after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand" : "text-text-muted hover:text-text-primary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {genres.length > 0 && <FilterMenu label="Genre" value={genre} options={genres.map((g) => ({ id: g.id, label: g.name }))} onChange={onGenre} />}
          <FilterMenu label="Access" value={access} options={ACCESS_OPTIONS} onChange={onAccess} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-small text-text-muted" aria-live="polite">
        {count !== null && <span>{count} {count === 1 ? "title" : "titles"}</span>}
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={c.clear}
            aria-label={`Remove filter ${c.label}`}
            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-white/8 pl-3 pr-2 text-text-primary hover:bg-white/14"
          >
            {c.label}
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ))}
        {chips.length > 1 && (
          <button type="button" onClick={onClear} className="min-h-9 px-1 font-semibold text-brand hover:underline">
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
