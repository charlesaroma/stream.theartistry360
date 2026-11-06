/* Buy Dialog (pay-per-view) */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PesapalCheckout from "@/components/payments/PesapalCheckout";
import PaymentLogo from "@/components/ui/PaymentLogo";
import { useMember } from "@/store/context/MemberContext";
import { PPV_STAGE_LABEL, RENTAL_HOURS, ppvStage } from "@/utils/access";
import { formatUGX } from "@/utils/formatCurrency";
import PriceBreakdown from "@/components/payments/PriceBreakdown";
import { useCharges } from "@/store/tanstackStore/queries/site";

// PesaPal's methods; the label is what the purchase record stores.
const METHODS = [
  { id: "mtn", label: "MTN MoMo", logos: ["mtn"] },
  { id: "airtel", label: "Airtel Money", logos: ["airtel"] },
  { id: "card", label: "Visa / Mastercard", logos: ["visa", "mastercard"] },
];

/**
 * Pay-per-view checkout. Live: off to PesaPal (it asks how to pay), which
 * sends the member back to /payment/return and then to the player; the
 * rental is granted only by PesaPal's word, never by this dialog. Demo: a
 * stand-in that grants it at once.
 */
export default function BuyDialog({ title, open, onClose, onDone }) {
  const { purchase, startCheckout, refreshAccess, demo } = useMember();
  // PesaPal's fee and system maintenance go on top of the title's price.
  const now = ppvStage(title.access);
  const charges = useCharges(now.priceUGX);
  // Live: PesaPal's page open in this dialog.
  const [checkout, setCheckout] = useState(null);
  const [method, setMethod] = useState("mtn");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setCheckout(null);
    setError("");
    onClose();
  };
  // PesaPal confirmed: the rental is on the account; on to the player.
  const paid = async () => {
    await refreshAccess().catch(() => {});
    close();
    onDone?.();
  };

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      if (!demo) {
        const order = await startCheckout({ kind: "ppv", titleId: title.id }, `/watch/${title.id}`);
        setCheckout({ ...order, amountUGX: charges.totalUGX, label: title.title });
        setBusy(false);
        return;
      }
      await purchase(title.id, METHODS.find((m) => m.id === method)?.label, `/watch/${title.id}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    // Close first: closing tidies the title page's URL, and must not undo
    // onDone's navigation to the player.
    onClose();
    onDone?.();
  };

  return (
    // No closing mid-payment.
    <Modal open={open} onClose={busy ? undefined : close} title={`Watch ${title.title}`} className={checkout ? "sm:max-w-2xl" : undefined}>
      {checkout ? (
        <PesapalCheckout checkout={checkout} onCompleted={paid} onFailed={(m) => { setCheckout(null); setError(m); }} onBack={() => setCheckout(null)} />
      ) : (
      <>
      <p className="text-body text-text-secondary">Pay once and it's yours to watch for {RENTAL_HOURS} hours from payment.</p>
      {PPV_STAGE_LABEL[now.stage] && (
        <p className="mt-2 text-small font-semibold text-brand">
          {PPV_STAGE_LABEL[now.stage]}
          {now.nextChangeAt && ` until ${new Date(now.nextChangeAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
        </p>
      )}
      <PriceBreakdown className="mt-4" label={`${RENTAL_HOURS} hours to watch`} charges={charges} />
      {/* Payment Method: real radios, styled as cards. Live, PesaPal asks on its own page. */}
      {!demo && <p className="mt-6 text-small text-text-secondary">You'll be taken to PesaPal to pay with MTN MoMo, Airtel Money or card.</p>}
      {demo && <fieldset className="mt-6">
        <legend className="mb-3 text-small font-semibold text-text-secondary">Pay with</legend>
        <div className="grid grid-cols-1 gap-2">
          {METHODS.map((m) => (
            <label key={m.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 transition-colors ${method === m.id ? "border-brand bg-brand/10" : "border-border-subtle hover:border-border-hover"}`}>
              <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="h-5 w-5 accent-(--color-brand)" />
              <span className="flex gap-1.5">{m.logos.map((l) => <PaymentLogo key={l} name={l} decorative />)}</span>
              <span className="text-body font-semibold">{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>}
      {error && <p role="alert" className="mt-4 text-small font-semibold text-danger">{error}</p>}
      <Button className="mt-8 w-full" onClick={pay} loading={busy}>Pay {formatUGX(charges.totalUGX)} with PesaPal</Button>
      <p className="mt-4 flex items-center justify-center gap-2 text-caption text-text-muted">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Secured by PesaPal: your card and PIN never reach our servers.{demo && " Demo mode: no money moves."}
      </p>
      <p className="mt-2 text-center text-caption text-text-muted">
        By paying you agree to our <Link to="/legal/terms" className="underline hover:text-brand">Terms</Link> and <Link to="/legal/refunds" className="underline hover:text-brand">Refunds policy</Link>.
      </p>
      </>
      )}
    </Modal>
  );
}
