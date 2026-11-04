/* Price Breakdown */
import { formatUGX } from "@/utils/formatCurrency";

/** What the payer will be asked for: the price, the charges on top (PesaPal's fee and system maintenance), and the total. */
export default function PriceBreakdown({ label, charges, className = "" }) {
  return (
    <dl className={`flex flex-col gap-1.5 rounded-2xl border border-border-subtle px-4 py-3 text-body ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-text-secondary">{label}</dt>
        <dd className="tabular-nums">{formatUGX(charges.priceUGX)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-text-secondary">Charges</dt>
        <dd className="tabular-nums">{formatUGX(charges.chargesUGX)}</dd>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-border-subtle pt-2">
        <dt className="font-semibold">Total</dt>
        <dd className="text-title tabular-nums">{formatUGX(charges.totalUGX)}</dd>
      </div>
    </dl>
  );
}
