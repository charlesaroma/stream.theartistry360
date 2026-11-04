/* Plans */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import PageIntro from "@/components/layout/PageIntro";
import PesapalCheckout from "@/components/payments/PesapalCheckout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useMember } from "@/store/context/MemberContext";
import { PlanCards } from "@/pages/2.home/sections/PlansBand";
import { usePageMeta } from "@/hooks/usePageMeta";
import { safeNext } from "@/utils/links";
import { pageMeta } from "@/seo/seo";
import PriceBreakdown from "@/components/payments/PriceBreakdown";
import { useCharges, usePlans } from "@/store/tanstackStore/queries/site";

export default function PlansPage() {
  const { member, subscribe, startCheckout, refreshAccess, demo } = useMember();
  usePageMeta({ title: "Plans", description: pageMeta("/plans").description });
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [chosen, setChosen] = useState(null);
  // PesaPal's fee and system maintenance go on top of the plan's price.
  const charges = useCharges(chosen?.priceUGX ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Live: PesaPal's page open in the dialog, { reference, redirectUrl, amountUGX, label }.
  const [checkout, setCheckout] = useState(null);
  // Where to return after paying, e.g. the title that sent them here. Empty when there is none.
  const next = safeNext(params.get("next"), "");
  // ?plan= (back from sign-up, or sent by the app): open that plan's checkout once, when signed in.
  const { data: plans = [] } = usePlans();
  const [asked, setAsked] = useState(false);
  const wanted = member && !asked ? plans.find((p) => p.id === params.get("plan")) : null;
  if (wanted) {
    setAsked(true);
    setChosen(wanted);
  }

  // Visitors sign up first and come back to this plan; members go straight to checkout.
  const choose = (plan) => {
    if (!member) return navigate(`/sign-up?next=${encodeURIComponent(`/plans?plan=${plan.id}${next ? `&next=${next}` : ""}`)}`, { viewTransition: true });
    setChosen(plan);
  };

  // Live: PesaPal opens in the dialog; the plan starts once PesaPal confirms (paid).
  // Demo: subscribe resolves without PesaPal, then return to where they came from.
  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      if (!demo) {
        const order = await startCheckout({ kind: "subscription", planId: chosen.id }, next || "/");
        setCheckout({ ...order, amountUGX: charges.totalUGX, label: `${chosen.name} plan` });
        setBusy(false);
        return;
      }
      await subscribe(chosen.id, undefined, next || "/");
    } catch (e) {
      setError(e.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    setChosen(null);
    navigate(next || "/", { viewTransition: true });
  };

  const close = () => {
    setChosen(null);
    setCheckout(null);
    setError("");
  };
  // PesaPal confirmed: the plan is on the account; carry on to where they were going.
  const paid = async () => {
    await refreshAccess().catch(() => {});
    close();
    navigate(next || "/", { viewTransition: true });
  };

  return (
    <>
      <PageIntro eyebrow="Plans" title="Choose your plan" lead="The whole library, without ads. Cancel any time." >
        {/* Already subscribed: say so, but still show the plans for switching. */}
        {member?.subscription?.status === "active" && (
          <p className="mt-6 inline-flex rounded-full bg-success/15 px-4 py-2 text-small font-semibold text-success">You're subscribed. Thank you for training with us.</p>
        )}
      </PageIntro>
      <div className="shell pb-[clamp(3rem,6vw,6rem)]">
        <PlanCards onChoose={choose} />
        <p className="mt-8 text-center text-small text-text-muted">Not ready? Create a free account and watch selected titles with ads.</p>
      </div>

      {/* Checkout Modal: can't be closed while the payment is starting. With PesaPal open it can:
          a payment finished there still counts, through PesaPal's own notice. */}
      <Modal open={Boolean(chosen)} onClose={busy ? undefined : close} title={`Subscribe: ${chosen?.name ?? ""}`} className={checkout ? "sm:max-w-2xl" : undefined}>
        {chosen && checkout && <PesapalCheckout checkout={checkout} onCompleted={paid} onFailed={(m) => { setCheckout(null); setError(m); }} onBack={() => setCheckout(null)} />}
        {chosen && !checkout && (
          <>
            <PriceBreakdown label={`${chosen.name} plan`} charges={charges} />
            <p className="mt-2 text-body text-text-secondary">You'll be taken to PesaPal to pay with MTN MoMo, Airtel Money or card.</p>
            {member?.subscription?.status === "active" && <p className="mt-2 text-small text-text-secondary">It adds its time on top of what's left on your plan.</p>}
            {error && <p role="alert" className="mt-4 text-small font-semibold text-danger">{error}</p>}
            <Button className="mt-8 w-full" onClick={pay} loading={busy}>Continue to PesaPal</Button>
            <p className="mt-4 flex items-center justify-center gap-2 text-caption text-text-muted"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Secured by PesaPal: your card and PIN never reach our servers.{demo && " Demo mode: no money moves."}</p>
            <p className="mt-2 text-center text-caption text-text-muted">
              {demo ? "Cancel any time. " : "Nothing renews by itself. "}By paying you agree to our <Link to="/legal/terms" className="underline hover:text-brand">Terms</Link> and <Link to="/legal/refunds" className="underline hover:text-brand">Refunds policy</Link>.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}
