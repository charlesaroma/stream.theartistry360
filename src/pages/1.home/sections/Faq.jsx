/* FAQ */
import { Plus } from "lucide-react";

const QA = [
  ["What is Artistry360 Stream?", "The Artistry360's streaming home: films, shorts and replays made by our actors."],
  ["How much does it cost?", "Start free: sign up and watch selected titles with ads. A subscription unlocks the whole library without ads. Some premieres are pay-per-view."],
  ["How do I pay?", "Through PesaPal with MTN MoMo, Airtel Money, Visa or Mastercard."],
  ["Can I watch on my phone?", "Yes, in any mobile browser today. The Android and iOS app follows."],
  ["Can I cancel?", "Any time. Your plan runs to the end of the period you paid for."],
];

export default function Faq() {
  return (
    <section className="shell section-y border-t border-border-default" aria-labelledby="faq-heading">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
        <h2 id="faq-heading" className="text-title">Questions</h2>
        <div className="divide-y divide-border-default border-y border-border-default">
          {QA.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 text-subheading [&::-webkit-details-marker]:hidden">
                {q}
                <Plus className="h-5 w-5 shrink-0 text-brand transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-6 text-body text-text-secondary">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
