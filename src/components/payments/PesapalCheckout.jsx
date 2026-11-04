/* PesaPal Checkout */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, LoaderCircle, Lock } from "lucide-react";

import { useCheckoutOrder } from "@/store/tanstackStore/queries/member";
import { formatUGX } from "@/utils/formatCurrency";

/** The message the return page sends from inside the frame (pages/11.payment/payment-return.jsx). */
export const RETURN_MESSAGE = "a360s:payment-return";

/**
 * PesaPal's own payment page, inside the site's dialog (PesaPal supports
 * this), as voting does on theartistry360.com: the member never leaves the
 * page. The outcome comes two ways: the return page inside the frame says
 * PesaPal is done, and the order is checked every few seconds anyway, which
 * also catches a payment approved on the phone or finished in another tab.
 * Only the API's answer (it asks PesaPal) counts.
 *
 * `checkout`: { reference, redirectUrl, amountUGX, label }.
 */
export default function PesapalCheckout({ checkout, onCompleted, onFailed, onBack }) {
  const payment = useCheckoutOrder(checkout.reference);
  const [loaded, setLoaded] = useState(false);
  const status = payment.order?.status;

  // The return page inside the frame: ask at once rather than wait for the next check.
  const { recheck } = payment;
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== RETURN_MESSAGE) return;
      if (e.data.reference === checkout.reference) recheck();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [checkout.reference, recheck]);

  // Settled: hand over once.
  const settled = useRef(false);
  useEffect(() => {
    if (settled.current || !payment.order) return;
    if (status === "completed") {
      settled.current = true;
      onCompleted(payment.order);
    } else if (status === "failed" || status === "reversed") {
      settled.current = true;
      onFailed(`PesaPal didn't confirm this payment, so nothing was charged to your account here. If money left your account, contact us and quote ${checkout.reference}.`);
    }
  }, [status, payment.order, checkout.reference, onCompleted, onFailed]);

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back" className="btn-icon h-10 w-10 shrink-0 hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-small font-bold">
            <Lock className="h-4 w-4 shrink-0 text-success" aria-hidden="true" /> Secure payment by PesaPal
          </p>
          <p className="truncate text-caption text-text-muted">{formatUGX(checkout.amountUGX)} · {checkout.label}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white">
        {!loaded && (
          <p role="status" className="absolute inset-0 grid place-items-center bg-surface-card text-small text-text-secondary">
            <span className="flex items-center gap-3">
              <LoaderCircle className="h-5 w-5 animate-spin text-brand" aria-hidden="true" /> Opening PesaPal…
            </span>
          </p>
        )}
        <iframe src={checkout.redirectUrl} title="PesaPal payment" allow="payment" onLoad={() => setLoaded(true)} className="h-[min(620px,70dvh)] w-full border-0" />
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-caption text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>{payment.gaveUp ? "PesaPal hasn't confirmed yet. If you paid, it starts as soon as it does." : "Approving on your phone? Keep this open; it updates by itself."}</span>
        <a href={checkout.redirectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 font-semibold text-text-secondary underline underline-offset-2 hover:text-brand">
          Open in a new tab <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
