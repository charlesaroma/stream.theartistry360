/* Payment Return */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";

import Button from "@/components/ui/Button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useMember } from "@/store/context/MemberContext";
import { CHECKOUT_KEY, getOrder } from "@/store/tanstackStore/queries/member";
import { safeNext } from "@/utils/links";

const EVERY_MS = 2500;
const GIVE_UP_MS = 90_000;

const readCheckout = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CHECKOUT_KEY) ?? "null");
  } catch {
    return null;
  }
};

/**
 * Where PesaPal sends a member after paying (?OrderMerchantReference=…).
 * It asks the API about the order until PesaPal has given its word: the plan
 * or rental is the API's to grant, never this page's. Then it refreshes what
 * the member may watch and goes on to where they were heading.
 */
export default function PaymentReturnPage() {
  usePageMeta({ title: "Payment", noindex: true });
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAccess } = useMember();
  const [checkout] = useState(readCheckout);
  const reference = params.get("OrderMerchantReference") ?? checkout?.reference ?? "";
  // Only a page on this site.
  const next = safeNext(checkout?.reference === reference ? checkout?.next : null, "/");
  const [state, setState] = useState(reference ? "checking" : "missing");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!reference) return undefined;
    let stopped = false;
    let timer;
    const started = Date.now();
    const ask = async () => {
      try {
        const o = await getOrder(reference);
        if (stopped) return;
        setOrder(o);
        if (o.status === "completed") {
          await refreshAccess().catch(() => {});
          try {
            sessionStorage.removeItem(CHECKOUT_KEY);
          } catch {
            // nothing to clear
          }
          if (!stopped) setState("paid");
          return;
        }
        if (o.status === "failed" || o.status === "reversed") return setState("failed");
      } catch {
        // Offline for a moment: keep asking.
      }
      if (Date.now() - started > GIVE_UP_MS) return setState("waiting");
      timer = setTimeout(ask, EVERY_MS);
    };
    ask();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reference, refreshAccess]);

  // Paid: carry on after a short look at the confirmation.
  useEffect(() => {
    if (state !== "paid") return undefined;
    const t = setTimeout(() => navigate(next, { replace: true, viewTransition: true }), 1800);
    return () => clearTimeout(t);
  }, [state, next, navigate]);

  const what = order?.itemName || (order?.titleId ? "Your title" : "Your plan");
  const view = {
    checking: { icon: LoaderCircle, spin: true, title: "Confirming your payment", body: "PesaPal is letting us know. This usually takes a few seconds." },
    paid: { icon: CircleCheck, tone: "text-success", title: "Payment received", body: `${what} is ready. Taking you there now.` },
    failed: { icon: TriangleAlert, tone: "text-danger", title: "The payment didn't go through", body: "Nothing was charged. You can try again, or use another way to pay." },
    waiting: { icon: TriangleAlert, tone: "text-warning", title: "Still waiting for PesaPal", body: "If you paid, it starts as soon as PesaPal confirms; you don't need to pay again. Check your Account in a few minutes." },
    missing: { icon: TriangleAlert, tone: "text-warning", title: "We couldn't find that payment", body: "If you paid, your plan or title shows on your Account once PesaPal confirms." },
  }[state];
  const Icon = view.icon;

  return (
    <section className="shell grid min-h-[80dvh] place-items-center pt-18 text-center">
      <div className="max-w-md" role="status" aria-live="polite">
        <Icon className={`mx-auto mb-6 h-12 w-12 ${view.tone ?? "text-brand"} ${view.spin ? "animate-spin" : ""}`} aria-hidden="true" />
        <h1 className="text-title">{view.title}</h1>
        <p className="mt-4 text-lead text-text-secondary">{view.body}</p>
        {reference && <p className="mt-4 text-caption text-text-muted">Reference {reference}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {state === "paid" && <Button to={next}>Continue</Button>}
          {state === "failed" && <Button to={next === "/" ? "/plans" : next}>Try again</Button>}
          {(state === "waiting" || state === "missing") && <Button to="/account">Go to Account</Button>}
          {state !== "checking" && state !== "paid" && <Button variant="glass" to="/">Home</Button>}
        </div>
      </div>
    </section>
  );
}
