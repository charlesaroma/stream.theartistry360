/* Buy Dialog (pay-per-view) */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useMember } from "@/store/context/MemberContext";
import { formatUGX } from "@/utils/formatCurrency";

const METHODS = [
  { id: "mtn", label: "MTN MoMo", swatch: "bg-mtn" },
  { id: "airtel", label: "Airtel Money", swatch: "bg-airtel" },
  { id: "card", label: "Visa / Mastercard", swatch: "bg-info" },
];

/**
 * Stand-in for the PesaPal checkout. The real flow redirects to PesaPal and
 * the purchase is granted only by the IPN webhook, never by this dialog.
 */
export default function BuyDialog({ title, open, onClose, onDone }) {
  const { purchase } = useMember();
  const [method, setMethod] = useState("mtn");
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    setBusy(true);
    await purchase(title.id, METHODS.find((m) => m.id === method)?.label);
    setBusy(false);
    // Close first: closing tidies the title page's URL, and must not undo
    // onDone's navigation to the player.
    onClose();
    onDone?.();
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} title={`Watch ${title.title}`}>
      <p className="text-body text-text-secondary">Pay once and it's yours to watch for 24 hours from first play.</p>
      <p className="mt-4 text-title tabular-nums">{formatUGX(title.access.priceUGX)}</p>
      <fieldset className="mt-6">
        <legend className="mb-3 text-small font-semibold text-text-secondary">Pay with</legend>
        <div className="grid grid-cols-1 gap-2">
          {METHODS.map((m) => (
            <label key={m.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 transition-colors ${method === m.id ? "border-brand bg-brand/10" : "border-border-subtle hover:border-border-hover"}`}>
              <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="h-5 w-5 accent-(--color-brand)" />
              <span className={`h-3 w-3 rounded-full ${m.swatch}`} aria-hidden="true" />
              <span className="text-body font-semibold">{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Button className="mt-8 w-full" onClick={pay} loading={busy}>Pay {formatUGX(title.access.priceUGX)} with PesaPal</Button>
      <p className="mt-4 flex items-center justify-center gap-2 text-caption text-text-muted">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Secured by PesaPal: your card and PIN never reach our servers. Demo mode: no money moves.
      </p>
      <p className="mt-2 text-center text-caption text-text-muted">
        By paying you agree to our <Link to="/legal/terms" className="underline hover:text-brand">Terms</Link> and <Link to="/legal/refunds" className="underline hover:text-brand">Refunds policy</Link>.
      </p>
    </Modal>
  );
}
