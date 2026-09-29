/* No Matches */
import BrandMark from "@/components/ui/brand/BrandMark";

/** The empty grid: the still logo, what happened, and the way back. */
export default function NoMatches({ onClear }) {
  return (
    <div className="shell flex flex-col items-center gap-4 py-16 text-center">
      <BrandMark className="h-14 w-14 opacity-60" />
      <h2 className="text-heading">No titles match these filters</h2>
      <p className="text-small text-text-muted">Try another genre or access, or search for something else.</p>
      <button type="button" onClick={onClear} className="min-h-11 rounded-full bg-brand px-5 text-small font-bold text-black hover:bg-white">
        Clear filters
      </button>
    </div>
  );
}
