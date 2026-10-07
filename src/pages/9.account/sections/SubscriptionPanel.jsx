/* Subscription */
import { useState } from "react";
import { Crown } from "lucide-react";

import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberContext";
import { usePlans } from "@/store/tanstackStore/queries/site";
import { formatUGX } from "@/utils/formatCurrency";
import { longDate } from "./dates";
import { Card, Status } from "./ui";

const PER = { month: "month", quarter: "3 months", year: "year" };

/** The plan, when it renews (or ends), and changing or cancelling it. */
export default function SubscriptionPanel() {
  const { member, setCancelAtPeriodEnd } = useMember();
  const { data: plans = [] } = usePlans();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({});
  const sub = member.subscription;
  const plan = plans.find((p) => p.id === sub?.planId);
  const active = sub?.status === "active";

  const setCancel = async (cancel) => {
    setBusy(true);
    setMsg({});
    try {
      await setCancelAtPeriodEnd(cancel);
      setMsg({ ok: cancel ? `Cancelled. You keep full access until ${longDate(sub.renewsAt)}.` : "Your plan will renew as normal." });
      setConfirming(false);
    } catch (e) {
      setMsg({ error: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (!active) {
    return (
      <Card title="Your plan" description="You're on the free plan: selected titles with ads. Subscribe for the whole library without ads.">
        <Button to="/plans?next=/account"><Crown className="h-4 w-4" aria-hidden="true" /> See plans</Button>
      </Card>
    );
  }

  return (
    <Card title="Your plan">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-brand/5 p-5">
        <div>
          <p className="flex items-center gap-2 text-subheading font-bold"><Crown className="h-5 w-5 text-brand" aria-hidden="true" /> {plan?.name ?? "Subscription"}</p>
          {plan && <p className="mt-1 text-small text-text-secondary">{formatUGX(plan.priceUGX)} every {PER[plan.interval]}</p>}
        </div>
        <p className="text-small text-text-secondary">
          {sub.cancelAtPeriodEnd ? <>Ends on <strong className="text-warning">{longDate(sub.renewsAt)}</strong></> : <>Renews on <strong className="text-text-primary">{longDate(sub.renewsAt)}</strong></>}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="glass" to="/plans?next=/account">Change plan</Button>
        {sub.cancelAtPeriodEnd ? (
          <Button onClick={() => setCancel(false)} loading={busy}>Keep my plan</Button>
        ) : confirming ? (
          <div className="w-full rounded-2xl border border-danger/30 bg-danger/5 px-5 py-4 flex flex-col gap-4">
            <p className="text-small text-text-secondary">Cancel? You keep access until {longDate(sub.renewsAt)}, then nothing more is charged.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="glass" onClick={() => setConfirming(false)}>Keep it</Button>
              <Button variant="danger" onClick={() => setCancel(true)} loading={busy}>Cancel plan</Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setConfirming(true)}>Cancel plan</Button>
        )}
      </div>
      <Status {...msg} />
    </Card>
  );
}
