/* Play Gate */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useMember } from "@/store/context/MemberContext";
import { usePlans } from "@/store/tanstackStore/queries/site";
import { RENTAL_HOURS, accessFor, periodLabel, ppvStage } from "@/utils/access";
import { formatUGX } from "@/utils/formatCurrency";
import GoogleButton from "@/pages/1.auth/sections/GoogleButton";
import BuyDialog from "./BuyDialog";

/**
 * What it takes to watch, shown only when someone presses Play (the client
 * wants no prices on the browse pages). Pay-per-view opens the checkout;
 * otherwise it says what it costs and offers the one next step. Signed out,
 * that's Continue with Google right here: signed in, the gate moves on in
 * place (the checkout, plans, or straight to the player).
 */
export default function PlayGate({ title, open, onClose }) {
  const { member } = useMember();
  const navigate = useNavigate();
  const { data: plans = [] } = usePlans();
  const access = accessFor(title, member);
  const tier = title.access?.tier;
  // After signing in, subscribing or paying, come back to the player.
  const next = encodeURIComponent(`/watch/${title.id}`);
  // Signed in from this gate: once they can watch, play, without a second press of Play.
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (signedIn && access.ok) navigate(`/watch/${title.id}`, { viewTransition: true });
  }, [signedIn, access.ok, navigate, title.id]);

  // Anyone who can watch never sees the gate.
  if (access.ok || !open) return null;
  if (access.reason === "buy") {
    return <BuyDialog title={title} open onClose={onClose} onDone={() => navigate(`/watch/${title.id}`, { viewTransition: true })} />;
  }

  // Quote the lowest plan price, as "from".
  const cheapest = [...plans].sort((a, b) => a.priceUGX - b.priceUGX)[0];
  const subscription = cheapest ? `Included with a subscription, from ${formatUGX(cheapest.priceUGX)} every ${periodLabel(cheapest)}.` : "Included with a subscription.";
  const lines = {
    free: ["Free to watch", "Continue with Google, and it plays straight away."],
    subscription: ["Watch with a subscription", subscription],
    ppv: [`Watch for ${formatUGX(ppvStage(title.access).priceUGX)}`, `Pay once, then watch for ${RENTAL_HOURS} hours from payment. Continue with Google first so it's saved to your account.`],
  };
  // An unknown tier falls back to the free copy.
  const [heading, body] = lines[tier] ?? lines.free;

  return (
    <Modal open onClose={onClose} title={heading}>
      <p className="text-body text-text-secondary">{access.reason === "subscribe" ? subscription : body}</p>
      <div className="mt-8 flex flex-col gap-3">
        {/* Signed in without a plan: plans. Signed out: Google (signs in or makes the account in one step). */}
        {access.reason === "subscribe" ? (
          <Button to={`/plans?next=${next}`} className="w-full"><Crown className="h-5 w-5" aria-hidden="true" /> See plans</Button>
        ) : (
          <GoogleButton next={`/watch/${title.id}`} onDone={() => setSignedIn(true)} />
        )}
      </div>
    </Modal>
  );
}
