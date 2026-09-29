/* Related List */
import { Link } from "react-router-dom";

import { useTaxonomy } from "@/store/tanstackStore/queries/site";

/** "More like this" as a column of small posters, for beside the player. */
export default function RelatedList({ titles, heading = "More like this" }) {
  const { typeName, categoryName } = useTaxonomy();
  if (!titles.length) return null;
  return (
    <section aria-labelledby="related-title">
      <h2 id="related-title" className="mb-3 text-small font-bold uppercase tracking-[0.15em] text-text-secondary">{heading}</h2>
      <ul className="flex flex-col gap-2">
        {titles.slice(0, 8).map((t) => (
          <li key={t.id}>
            <Link to={`/title/${t.id}`} viewTransition className="group flex items-center gap-3 overflow-hidden rounded-2xl bg-surface-card/60 pr-3 transition-colors hover:bg-white/8">
              <img src={t.poster} alt="" loading="lazy" className="aspect-2/3 w-16 shrink-0 object-cover" />
              <span className="min-w-0 py-2">
                <span className="line-clamp-2 text-small font-semibold text-text-primary group-hover:text-brand">{t.title}</span>
                <span className="mt-1 block truncate text-caption text-text-muted">
                  {[categoryName(t.categoryIds?.[0]) || typeName(t.type), t.releaseYear, t.ageRating].filter(Boolean).join(" · ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
