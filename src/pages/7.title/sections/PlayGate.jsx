/* Play Gate */
import { useNavigate } from "react-router-dom";
import { Crown, LogIn, UserPlus } from "lucide-react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useMember } from "@/store/context/MemberContext";
import { usePlans } from "@/store/tanstackStore/queries/site";
import { accessFor } from "@/utils/access";
import { formatUGX } from "@/utils/formatCurrency";
import BuyDialog from "./BuyDialog";

const PER = { month: "a month", quarter: "a quarter", year: "a year" };

/**
 * What it takes to watch, shown only when someone presses Play (the client
 * wants no prices on the browse pages). Pay-per-view opens the checkout;
 * otherwise it says what it costs and offers the one next step.
 */
export default function PlayGate({ title, open, onClose }) {
  const { member } = useMember();
  const navigate = useNavigate();
  const { data: plans = [] } = usePlans();
  const access = accessFor(title, member);
  const tier = title.access?.tier;
  const next = encodeURIComponent(`/watch/${title.id}`);

  if (access.ok || !open) return null;
  if (access.reason === "buy") {
    return <BuyDialog title={title} open onClose={onClose} onDone={() => navigate(`/watch/${title.id}`, { viewTransition: true })} />;
  }

  const cheapest = [...plans].sort((a, b) => a.priceUGX - b.priceUGX)[0];
  const subscription = cheapest ? `Included with a subscription, from ${formatUGX(cheapest.priceUGX)} ${PER[cheapest.interval] ?? ""}.` : "Included with a subscription.";
  const lines = {
    free: ["Free to watch", "Create a free account or sign in, and it plays straight away."],
    subscription: ["Watch with a subscription", subscription],
    ppv: [`Watch for ${formatUGX(title.access?.priceUGX)}`, "Pay once, then watch for 48 hours from first play. Sign in first so it's saved to your account."],
  };
  const [heading, body] = lines[tier] ?? lines.free;

  return (
    <Modal open onClose={onClose} title={heading}>
      <p className="text-body text-text-secondary">{access.reason === "subscribe" ? subscription : body}</p>
      <div className="mt-8 flex flex-col gap-3">
        {access.reason === "subscribe" ? (
          <Button to={`/plans?next=${next}`} className="w-full"><Crown className="h-5 w-5" aria-hidden="true" /> See plans</Button>
        ) : (
          <>
            <Button to={`/sign-in?next=${next}`} className="w-full"><LogIn className="h-5 w-5" aria-hidden="true" /> Sign in</Button>
            <Button variant="glass" to={`/sign-up?next=${next}`} className="w-full"><UserPlus className="h-5 w-5" aria-hidden="true" /> Create a free account</Button>
          </>
        )}
      </div>
    </Modal>
  );
}
