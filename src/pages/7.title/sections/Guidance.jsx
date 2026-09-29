/* Parental Guidance */
import { ShieldAlert } from "lucide-react";

import AgeBadge from "@/components/title/AgeBadge";
import { advisoryLine, ratingOf } from "@/utils/ageRatings";

/** The rating in words and the title's content warnings, so parents can decide. */
export default function Guidance({ title }) {
  const r = ratingOf(title.ageRating);
  if (!r) return null;
  const warnings = title.advisories ?? [];
  return (
    <section aria-labelledby="guidance-heading" className="rounded-2xl border border-white/8 bg-surface-card/60 p-5">
      <h2 id="guidance-heading" className="mb-3 flex items-center gap-2 text-small font-bold uppercase tracking-[0.15em] text-text-secondary">
        <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Parental guidance
      </h2>
      <div className="flex items-start gap-4">
        <AgeBadge value={title.ageRating} size="lg" />
        <div className="text-small">
          <p className="font-semibold text-text-primary">{r.name}. <span className="font-normal text-text-secondary">{r.meaning}</span></p>
          <p className="mt-1 text-text-secondary">{warnings.length ? <>Contains {advisoryLine(warnings).toLowerCase()}.</> : "No content warnings."}</p>
        </div>
      </div>
    </section>
  );
}
