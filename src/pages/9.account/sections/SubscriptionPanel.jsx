/* Subscription */
import { useState } from "react";
import { Crown } from "lucide-react";

import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberContext";
import { usePlans } from "@/store/tanstackStore/queries/site";
import { formatUGX } from "@/utils/formatCurrency";
import { longDate } from "./dates";
import { periodLabel } from "@/utils/access";
import { Card, Status, SwitchRow } from "./ui";


/**
 * The plan, when it renews (or ends), and changing or cancelling it. Against
 * the API a plan is paid a period at a time through PesaPal, never charged by
 * itself, so it shows what's paid up and a way to renew instead.
 */
export default function SubscriptionPanel() {
  const { member, setCancelAtPeriodEnd, demo } = useMember();
  const { data: plans = [] } = usePlans();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({});
  const sub = member.subscription;
  // Plans may still be loading, so the name and price fall back below.
  const plan = plans.find((p) => p.id === sub?.planId);
  const active = sub?.status === "active";

  // Cancelling stops renewal only; access runs to the end of the paid period. Passing false undoes it.
  const setCancel = async (cancel) => {
    setBusy(true);
    setMsg({});
    try {
      await setCancelAtPeriodEnd(cancel);
      setMsg({ ok: !demo ? (cancel ? "Reminders off. You keep full access until the date above." : "We'll email you before your plan ends.") : cancel ? `Cancelled. You keep full access until ${longDate(sub.renewsAt)}.` : "Your plan will renew as normal." });
      setConfirming(false);
    } catch (e) {
      setMsg({ error: e.message });
    } finally {
      setBusy(false);
    }
  };

  // No active plan: the free tier, with a way in.
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
          {plan && <p className="mt-1 text-small text-text-secondary">{formatUGX(plan.priceUGX)} every {periodLabel(plan)}</p>}
        </div>
        <p className="text-small text-text-secondary">
          {!demo ? <>Paid until <strong className="text-text-primary">{longDate(sub.renewsAt)}</strong></> : sub.cancelAtPeriodEnd ? <>Ends on <strong className="text-warning">{longDate(sub.renewsAt)}</strong></> : <>Renews on <strong className="text-text-primary">{longDate(sub.renewsAt)}</strong></>}
        </p>
      </div>

      {!demo ? (
        <div className="mt-5 flex flex-col gap-3">
          <p className="text-small text-text-secondary">Nothing is charged by itself. Renew before then to keep watching; a renewal adds its time on top of what's left.</p>
          <div><Button variant="glass" to="/plans?next=/account">Renew or change plan</Button></div>
          {/* Reminders: "cancel" in the API means don't remind me. */}
          <SwitchRow
            label="Email me before my plan ends"
            hint={`Three days before ${longDate(sub.renewsAt)}, and once it has ended, to ${member.email}.`}
            checked={!sub.cancelAtPeriodEnd}
            disabled={busy}
            onChange={(on) => setCancel(!on)}
          />
        </div>
      ) : (
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="glass" to="/plans?next=/account">Change plan</Button>
        {/* Already cancelled: offer to keep it. Otherwise, a two-step cancel. */}
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
      )}
      <Status {...msg} />
    </Card>
  );
}
