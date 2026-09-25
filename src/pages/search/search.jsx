/* Search */
import { useDeferredValue } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

import PageIntro from "@/components/layout/PageIntro";
import TitleGrid from "@/components/title/TitleGrid";
import { useSearch } from "@/hooks/useCatalog";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const deferred = useDeferredValue(q);
  const { data: results = [], isFetching } = useSearch(deferred);

  return (
    <>
      <PageIntro title="Search">
        <label className="relative mt-8 block max-w-3xl">
          <span className="sr-only">Search titles, cast and crew</span>
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
            placeholder="Titles, actors, coaches…"
            className="input min-h-16 rounded-full pl-14 text-lead"
          />
        </label>
        <p className="mt-4 text-small text-text-muted" aria-live="polite">
          {deferred.trim().length > 1 ? (isFetching ? "Searching…" : `${results.length} ${results.length === 1 ? "result" : "results"}`) : "Type at least two letters."}
        </p>
      </PageIntro>
      <div className="pb-[clamp(3rem,6vw,6rem)]">
        {deferred.trim().length > 1 && <TitleGrid titles={results} empty={`Nothing found for "${deferred}".`} />}
      </div>
    </>
  );
}
