/* Age Badge */
import { ratingOf } from "@/utils/ageRatings";
import { cn } from "@/utils/cn";

/**
 * The age rating as a small bordered badge in its own colour, with its
 * meaning for screen readers and on hover ("PG: Parental guidance. …").
 */
export default function AgeBadge({ value, size = "sm", className }) {
  const r = ratingOf(value);
  if (!r) return null;
  const meaning = `Rated ${r.label}: ${r.name}. ${r.meaning}`;
  return (
    <abbr
      title={meaning}
      aria-label={meaning}
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border font-bold tabular-nums no-underline",
        size === "lg" ? "px-2 py-0.5 text-small" : "px-1 text-caption leading-4",
        r.tone,
        className,
      )}
    >
      {r.label}
    </abbr>
  );
}
