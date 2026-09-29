/* Reels Toolbar */
import { Play } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { REEL_CATEGORIES, REEL_TABS } from "@/utils/reels";

const chip = (on) =>
  cn(
    "ember min-h-11 shrink-0 cursor-pointer rounded-full border px-4 text-small font-semibold transition-colors",
    on
      ? "border-brand bg-brand text-black"
      : "border-border-subtle text-text-secondary hover:border-border-hover hover:text-text-primary",
  );

/**
 * One row under the navbar: the page name, category chips, the Trending /
 * New / Most liked tabs, and Play Feed. It wraps on narrow screens, so the
 * first reels are always in the first screen.
 */
export default function ReelsToolbar({ category, onCategory, tab, onTab, onPlayFeed, canPlay }) {
  return (
    <header className="shell flex flex-wrap items-center gap-x-6 gap-y-3 pb-6 pt-[calc(4.5rem+clamp(1.25rem,3vw,2rem))]">
      <h1 className="text-heading">Reels</h1>

      <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 py-1">
        <button type="button" aria-pressed={!category} onClick={() => onCategory("")} className={chip(!category)}>
          All
        </button>
        {REEL_CATEGORIES.filter((c) => c.id !== "teaser").map((c) => (
          <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => onCategory(c.id)} className={chip(category === c.id)}>
            <span className={cn("mr-2 inline-block h-2 w-2 rounded-full", c.dot)} aria-hidden="true" />
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div role="tablist" aria-label="Order" className="flex rounded-full border border-border-subtle p-1">
          {REEL_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onTab(t.id)}
              className={cn(
                "min-h-9 rounded-full px-3.5 text-small font-semibold transition-colors",
                tab === t.id ? "bg-white/12 text-text-primary" : "text-text-muted hover:text-text-primary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button onClick={onPlayFeed} disabled={!canPlay} className="gap-2 px-5 font-bold">
          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
          Play Feed
        </Button>
      </div>
    </header>
  );
}
