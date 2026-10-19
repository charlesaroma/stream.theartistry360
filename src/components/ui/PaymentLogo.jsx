/* Payment Logo */
// The payment networks' own marks (Wikimedia Commons originals, in
// src/assets/payments), each on the tile its brand expects: MTN's black
// mark on MTN yellow, the others on white. Shown only to say how people
// can pay; they are the networks' trademarks.
import airtel from "@/assets/payments/airtel.svg";
import mastercard from "@/assets/payments/mastercard.svg";
import mtn from "@/assets/payments/mtn.svg";
import visa from "@/assets/payments/visa.svg";
import { cn } from "@/utils/cn";

// Tile colours are the brands' own, so they are raw values rather than tokens.
const LOGOS = {
  mtn: { src: mtn, alt: "MTN MoMo", tile: "bg-[#ffcc00]" },
  airtel: { src: airtel, alt: "Airtel Money", tile: "bg-white" },
  visa: { src: visa, alt: "Visa", tile: "bg-white" },
  mastercard: { src: mastercard, alt: "Mastercard", tile: "bg-white" },
};

/** One network's logo tile. `decorative` when a text label sits beside it. */
export default function PaymentLogo({ name, decorative = false, className }) {
  const logo = LOGOS[name];
  return (
    <span className={cn("inline-flex h-8 w-12 shrink-0 items-center justify-center rounded-md px-1.5 py-1 shadow-sm", logo.tile, className)}>
      <img src={logo.src} alt={decorative ? "" : logo.alt} className="h-full max-w-full object-contain" loading="lazy" />
    </span>
  );
}

/** Every way to pay, in a row: footers and checkout notes. */
export function PaymentLogos({ className }) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)} role="list" aria-label="Pay with MTN MoMo, Airtel Money, Visa or Mastercard">
      {/* The wrapper's aria-label already lists every network. */}
      {Object.keys(LOGOS).map((name) => (
        <span key={name} role="listitem"><PaymentLogo name={name} /></span>
      ))}
    </span>
  );
}
