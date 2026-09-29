/* Films (the catalogue) */
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import PageIntro from "@/components/layout/PageIntro";
import TitleGrid from "@/components/title/TitleGrid";
import { useTaxonomy, useTitles } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "popular", label: "Most watched" },
  { id: "az", label: "A–Z" },
];
const ACCESS = [
  { id: "free", label: "Free" },
  { id: "subscription", label: "Subscribers" },
  { id: "ppv", label: "Pay-per-view" },
];

function Chips({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
      {[{ id: "", label: "All" }, ...options].map((o) => (
        <button
          key={o.id || "all"}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn("ember min-h-11 shrink-0 cursor-pointer rounded-full border px-4 text-small font-semibold transition-colors", value === o.id ? "border-brand bg-brand text-black" : "border-border-subtle text-text-secondary hover:border-border-hover hover:text-text-primary")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Every title, filterable by type, category and access. Filters live in the URL. */
export default function FilmsPage() {
  const [params, setParams] = useSearchParams();
  const { data: titles = [], isLoading } = useTitles();
  const { types, categories } = useTaxonomy();
  const type = params.get("type") ?? "";
  const category = params.get("category") ?? "";
  const access = params.get("access") ?? "";
  const sort = params.get("sort") ?? "new";

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const out = titles.filter((t) => (!type || t.type === type) && (!category || t.categoryIds?.includes(category)) && (!access || t.access?.tier === access));
    if (sort === "popular") return out.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    if (sort === "az") return out.sort((a, b) => a.title.localeCompare(b.title));
    return out.sort((a, b) => new Date(b.releaseAt) - new Date(a.releaseAt));
  }, [titles, type, category, access, sort]);

  return (
    <>
      <PageIntro eyebrow="Browse" title="Films, shorts and classes" lead="Everything made and taught at The Artistry360.">
        <div className="mt-8 flex flex-col gap-3">
          <Chips label="Type" options={types.map((t) => ({ id: t.id, label: t.name }))} value={type} onChange={(v) => set("type", v)} />
          <Chips label="Category" options={categories.map((c) => ({ id: c.id, label: c.name }))} value={category} onChange={(v) => set("category", v)} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Chips label="Access" options={ACCESS} value={access} onChange={(v) => set("access", v)} />
            <label className="flex items-center gap-3 text-small text-text-muted">
              Sort
              <select value={sort} onChange={(e) => set("sort", e.target.value === "new" ? "" : e.target.value)} className="input min-h-10 w-auto rounded-full py-2 text-small">
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>
          <p className="text-small text-text-muted" aria-live="polite">{isLoading ? "Loading…" : `${list.length} ${list.length === 1 ? "title" : "titles"}`}</p>
        </div>
      </PageIntro>
      <div className="pb-[clamp(3rem,6vw,6rem)]">
        <TitleGrid titles={list} empty="Nothing matches those filters yet." />
      </div>
    </>
  );
}
