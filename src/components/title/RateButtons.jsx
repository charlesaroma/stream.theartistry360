/* Rate Buttons */
import { useMember } from "@/store/context/MemberContext";
import { useRatings } from "@/store/tanstackStore/queries/member";
import { cn } from "@/utils/cn";
import { RATINGS } from "@/utils/ratings";


export default function RateButtons({ titleId, size = "md", showLabels = false, className }) {
  const { member } = useMember();
  const { ratings, rate } = useRatings();
  const current = ratings[titleId];
  if (!member) return null;

  return (
    <div role="group" aria-label="Rate this title" className={cn("flex items-center gap-2", className)}>
      {RATINGS.map(({ id, label, icon: Glyph }) => {
        const on = current === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => rate(titleId, id)}
            aria-pressed={on}
            title={label}
            aria-label={label}
            data-glass=""
            className={cn(
              "molten-glass ember relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-colors",
              size === "lg" ? "min-h-14 px-5 text-body" : "min-h-12 px-4 text-small",
              !showLabels && (size === "lg" ? "w-14 px-0" : "w-12 px-0"),
              on && (id === "love" ? "bg-danger/25 text-danger" : "bg-brand/25 text-brand-300"),
            )}
          >
            <Glyph className={cn(size === "lg" ? "h-6 w-6" : "h-5 w-5", on && "fill-current")} aria-hidden="true" />
            {showLabels && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
