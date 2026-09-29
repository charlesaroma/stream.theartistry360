/* Plans */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import PageIntro from "@/components/layout/PageIntro";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useMember } from "@/store/context/MemberContext";
import { formatUGX } from "@/utils/formatCurrency";
import { PlanCards } from "@/pages/2.home/sections/PlansBand";
import { usePageMeta } from "@/hooks/usePageMeta";
import { safeNext } from "@/utils/links";

export default function PlansPage() {
  const { member, subscribe } = useMember();
  usePageMeta({ title: "Plans", description: "Watch every Artistry360 film, series and class. Pay by MTN MoMo, Airtel Money or card." });
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [chosen, setChosen] = useState(null);
  const [busy, setBusy] = useState(false);
  const next = safeNext(params.get("next"), "");

  const choose = (plan) => {
    if (!member) return navigate(`/sign-up?next=${encodeURIComponent(`/plans?plan=${plan.id}${next ? `&next=${next}` : ""}`)}`, { viewTransition: true });
    setChosen(plan);
  };

  const pay = async () => {
    setBusy(true);
    await subscribe(chosen.id);
    setBusy(false);
    setChosen(null);
    navigate(next || "/", { viewTransition: true });
  };

  return (
    <>
      <PageIntro eyebrow="Plans" title="Choose your plan" lead="The whole library, without ads. Cancel any time." >
        {member?.subscription?.status === "active" && (
          <p className="mt-6 inline-flex rounded-full bg-success/15 px-4 py-2 text-small font-semibold text-success">You're subscribed. Thank you for training with us.</p>
        )}
      </PageIntro>
      <div className="shell pb-[clamp(3rem,6vw,6rem)]">
        <PlanCards onChoose={choose} />
        <p className="mt-8 text-center text-small text-text-muted">Not ready? Create a free account and watch selected titles with ads.</p>
      </div>

      <Modal open={Boolean(chosen)} onClose={busy ? undefined : () => setChosen(null)} title={`Subscribe: ${chosen?.name ?? ""}`}>
        {chosen && (
          <>
            <p className="text-title tabular-nums">{formatUGX(chosen.priceUGX)}</p>
            <p className="mt-2 text-body text-text-secondary">You'll be taken to PesaPal to pay with MTN MoMo, Airtel Money or card.</p>
            <Button className="mt-8 w-full" onClick={pay} loading={busy}>Continue to PesaPal</Button>
            <p className="mt-4 flex items-center justify-center gap-2 text-caption text-text-muted"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Secured by PesaPal: your card and PIN never reach our servers. Demo mode: no money moves.</p>
            <p className="mt-2 text-center text-caption text-text-muted">
              Cancel any time. By paying you agree to our <Link to="/legal/terms" className="underline hover:text-brand">Terms</Link> and <Link to="/legal/refunds" className="underline hover:text-brand">Refunds policy</Link>.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}
