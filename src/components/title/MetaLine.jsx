/* Title Meta Line */
import { useTaxonomy } from "@/store/tanstackStore/queries/site";
import { likedPercent } from "@/utils/access";
import { cn } from "@/utils/cn";
import { isSeries, seasonCount } from "@/utils/episodes";
import { formatDuration } from "@/utils/format";

/** "Film · 2026 · 16+ · 1:42:00", one dot-separated line everywhere. */
export default function MetaLine({ title, className }) {
  const { typeName } = useTaxonomy();
  const parts = [typeName(title.type), title.releaseYear, title.ageRating, isSeries(title) ? `${seasonCount(title)} ${seasonCount(title) === 1 ? "season" : "seasons"}` : formatDuration(title.video?.duration)].filter((p) => p && p !== "—");
  const liked = likedPercent(title.ratings);
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-small text-text-secondary", className)}>
      {liked !== null && <span className="font-bold text-success">{liked}% liked it</span>}
      {parts.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {(i > 0 || liked !== null) && <span className="h-1 w-1 rounded-full bg-text-muted" aria-hidden="true" />}
          {p}
        </span>
      ))}
    </p>
  );
}
