/* Films (the catalogue) */
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import TitleGrid from "@/components/title/TitleGrid";
import { useTaxonomy, useTitles } from "@/store/tanstackStore/queries/site";
import { SORTS, featuredIn, genresFor, inTab, matchesQuery, tabOf } from "@/utils/catalog";
import FeaturedFilm from "./sections/FeaturedFilm";
import FilmRows from "./sections/FilmRows";
import FilmsHeader from "./sections/FilmsHeader";
import FilterBar from "./sections/FilterBar";
import NoMatches from "./sections/NoMatches";

/**
 * Every title. People browse rows and search grids: with no filters the tab
 * shows its featured film and rows; a genre, access filter or search turns
 * it into a sorted grid. Everything lives in the URL (?tab, ?genre, ?access,
 * ?q, ?sort), so filters survive Back and can be shared.
 */
export default function FilmsPage() {
  const [params, setParams] = useSearchParams();
  const { data: titles = [], isLoading } = useTitles();
  const { categories } = useTaxonomy();

  const tab = tabOf(params.get("tab") ?? "");
  const genre = params.get("genre") ?? "";
  const access = params.get("access") ?? "";
  const query = params.get("q") ?? "";
  const sort = SORTS.find((s) => s.id === params.get("sort")) ?? SORTS[0];
  const filtering = Boolean(genre || access || query.trim());

  const update = (changes) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true });
  };

  const tabTitles = useMemo(() => titles.filter(inTab(tab)), [titles, tab]);
  const genres = useMemo(() => genresFor(tabTitles, categories), [tabTitles, categories]);
  const grid = useMemo(
    () =>
      tabTitles
        .filter((t) => (!genre || t.categoryIds?.includes(genre)) && (!access || t.access?.tier === access) && matchesQuery(t, query))
        .sort(sort.sort),
    [tabTitles, genre, access, query, sort],
  );
  const featured = filtering ? null : featuredIn(tabTitles);
  const clear = () => update({ genre: "", access: "", q: "" });

  return (
    <>
      <FilmsHeader
        query={query}
        onQuery={(q) => update({ q })}
        sort={sort.id}
        onSort={(id) => update({ sort: id === "new" ? "" : id })}
        showSort={filtering}
      />
      <FilterBar
        tab={tab}
        // Genres differ per tab, so a new tab starts without one.
        onTab={(id) => update({ tab: id, genre: "" })}
        genres={genres}
        genre={genre}
        onGenre={(id) => update({ genre: id })}
        access={access}
        onAccess={(id) => update({ access: id })}
        query={query}
        onQuery={(q) => update({ q })}
        count={isLoading ? null : filtering ? grid.length : tabTitles.length}
        onClear={clear}
      />

      <div className="pb-[clamp(3rem,6vw,6rem)]">
        {isLoading ? (
          <div className="shell grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6" aria-busy="true">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-2/3 animate-pulse rounded-2xl bg-surface-card/60" />)}
          </div>
        ) : filtering ? (
          grid.length ? <TitleGrid titles={grid} /> : <NoMatches onClear={clear} />
        ) : (
          <>
            {featured && <FeaturedFilm title={featured} eyebrow={tab.id ? `Featured in ${tab.label}` : "Featured"} />}
            <FilmRows tab={tab} titles={tabTitles} genres={genres} />
          </>
        )}
      </div>
    </>
  );
}
