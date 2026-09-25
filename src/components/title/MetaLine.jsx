/* Title Meta Line */
import { useTaxonomy } from "@/hooks/useCatalog";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/format";

/** "Film · 2026 · 16+ · 1:42:00", one dot-separated line everywhere. */
export default function MetaLine({ title, className }) {
  const { typeName } = useTaxonomy();
  const parts = [typeName(title.type), title.releaseYear, title.ageRating, formatDuration(title.video?.duration)].filter((p) => p && p !== "—");
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-small text-text-secondary", className)}>
      {parts.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && <span className="h-1 w-1 rounded-full bg-text-muted" aria-hidden="true" />}
          {p}
        </span>
      ))}
    </p>
  );
}
