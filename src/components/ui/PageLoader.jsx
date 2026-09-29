/* Page Loader */
import BrandMark from "@/components/ui/brand/BrandMark";

// The orbit turns while the A holds still; it fades in after a beat, so a
// fast load shows nothing.
export default function PageLoader({ className = "min-h-dvh" }) {
  return (
    <div role="status" aria-label="Loading" className={`grid place-items-center ${className}`}>
      <BrandMark motion="spin" className="brand-loader h-12 w-12" />
    </div>
  );
}
