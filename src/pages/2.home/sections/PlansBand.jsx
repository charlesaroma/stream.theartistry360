/* Plans Band */
import { Check } from "lucide-react";

import Button from "@/components/ui/Button";
import { usePlans } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { formatUGX } from "@/utils/formatCurrency";

const PER = { month: "month", quarter: "3 months", year: "year" };

/** The pricing cards, shared by the home page (signed out) and /plans. */
export function PlanCards({ onChoose }) {
  const { data: plans = [] } = usePlans();
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {plans.map((p) => (
        <article
          key={p.id}
          data-glass={p.highlight ? "" : undefined}
          className={cn("relative flex flex-col rounded-3xl p-7", p.highlight ? "molten-glass" : "border border-border-default bg-surface-secondary")}
        >
          {p.highlight && <span className="chip absolute right-5 top-5 bg-brand text-black">Most popular</span>}
          <h3 className="text-subheading">{p.name}</h3>
          <p className="mt-4 flex items-baseline gap-1">
            <span className="text-title tabular-nums">{formatUGX(p.priceUGX)}</span>
            <span className="text-small text-text-muted">/ {PER[p.interval]}</span>
          </p>
          <ul className="mt-6 flex flex-1 flex-col gap-3">
            {p.benefits.map((b) => (
              <li key={b} className="flex gap-3 text-small text-text-secondary"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />{b}</li>
            ))}
          </ul>
          <Button variant={p.highlight ? "primary" : "glass"} className="mt-8 w-full" {...(onChoose ? { onClick: () => onChoose(p) } : { to: `/plans?plan=${p.id}` })}>
            Choose {p.name}
          </Button>
        </article>
      ))}
    </div>
  );
}

export default function PlansBand() {
  return (
    <section className="shell section-y" aria-labelledby="plans-heading">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">Plans</p>
        <h2 id="plans-heading" className="text-title">Watch everything, anywhere</h2>
        <p className="mt-4 text-lead text-text-secondary">One plan for the whole library, with no ads. Or start free and watch selected titles with ads.</p>
      </div>
      <PlanCards />
    </section>
  );
}
