/* Why The Artistry360 */
import { Clapperboard, Smartphone, Sparkles, Wallet } from "lucide-react";

const POINTS = [
  { icon: Sparkles, title: "Start free", text: "Create an account and watch selected titles free, with short ads." },
  { icon: Clapperboard, title: "Films by our actors", text: "Watch the films our students make, from shorts to features." },
  { icon: Wallet, title: "Pay your way", text: "MTN MoMo, Airtel Money or card, through PesaPal." },
  { icon: Smartphone, title: "Any screen", text: "Web today, and the Android and iOS app soon." },
];

export default function WhyStrip() {
  return (
    <section className="shell section-y border-t border-border-default" aria-labelledby="why-heading">
      <h2 id="why-heading" className="text-title mb-10 max-w-2xl">Stories made in Kampala</h2>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(({ icon: Glyph, title, text }) => (
          <li key={title}>
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand/12 text-brand"><Glyph className="h-6 w-6" aria-hidden="true" /></span>
            <h3 className="text-subheading">{title}</h3>
            <p className="mt-2 text-small text-text-secondary">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
