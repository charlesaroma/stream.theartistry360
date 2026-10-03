/* Purchases And Payments */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, ReceiptText } from "lucide-react";

import Modal from "@/components/ui/Modal";
import { useMember } from "@/store/context/MemberContext";
import { usePayments } from "@/store/tanstackStore/queries/member";
import { useTitles } from "@/store/tanstackStore/queries/site";
import { formatUGX } from "@/utils/formatCurrency";
import { shortDate } from "./dates";
import { Card } from "./ui";

/** Films bought (pay-per-view) and every payment, each with a receipt. */
export default function PurchasesPanel() {
  const { member } = useMember();
  const { data: titles = [] } = useTitles();
  const { data: payments = [], isLoading } = usePayments();
  const [receipt, setReceipt] = useState(null);
  const owned = member.purchases.map((id) => titles.find((t) => t.id === id)).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <Card title="Films you bought" description="Pay-per-view films are yours to watch for 24 hours from when you first press Play.">
        {owned.length ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {owned.map((t) => (
              <li key={t.id} className="flex items-center gap-4 rounded-2xl bg-white/4 p-3">
                <img src={t.poster} alt="" className="aspect-2/3 w-14 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{t.title}</span>
                  <span className="text-caption text-success">Owned</span>
                </span>
                <Link to={`/watch/${t.id}`} viewTransition className="btn btn-light min-h-10 px-4"><Play className="h-4 w-4 fill-current" aria-hidden="true" /> Watch</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-small text-text-muted">No films bought yet.</p>
        )}
      </Card>

      <Card title="Payment history" description="Every payment through PesaPal (MTN MoMo, Airtel Money or card). Quote the reference if you contact us about one.">
        {payments.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-140 text-left text-small">
              <thead>
                <tr className="text-caption uppercase tracking-[0.12em] text-text-muted">
                  <th className="px-2 pb-2 font-semibold">Date</th>
                  <th className="px-2 pb-2 font-semibold">For</th>
                  <th className="px-2 pb-2 font-semibold">Paid with</th>
                  <th className="px-2 pb-2 text-right font-semibold">Amount</th>
                  <th className="px-2 pb-2"><span className="sr-only">Receipt</span></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-white/8">
                    <td className="whitespace-nowrap px-2 py-3 text-text-secondary">{shortDate(p.paidAt)}</td>
                    <td className="px-2 py-3 text-text-primary">{p.description}</td>
                    <td className="px-2 py-3 text-text-secondary">{p.method}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">{formatUGX(p.amountUGX)}</td>
                    <td className="px-2 py-3 text-right">
                      <button type="button" onClick={() => setReceipt(p)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-brand hover:bg-brand/10">
                        <ReceiptText className="h-4 w-4" aria-hidden="true" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-small text-text-muted">{isLoading ? "Loading…" : "No payments yet. When you subscribe or buy a film, the receipt appears here."}</p>
        )}
      </Card>

      <Modal open={Boolean(receipt)} onClose={() => setReceipt(null)} title="Receipt">
        {receipt && (
          <dl className="grid grid-cols-[8rem_minmax(0,1fr)] gap-y-3 text-small">
            <dt className="text-text-muted">Paid</dt><dd>{new Date(receipt.paidAt).toLocaleString("en-GB")}</dd>
            <dt className="text-text-muted">For</dt><dd>{receipt.description}</dd>
            <dt className="text-text-muted">Amount</dt><dd className="font-bold">{formatUGX(receipt.amountUGX)}</dd>
            <dt className="text-text-muted">Paid with</dt><dd>{receipt.method}</dd>
            <dt className="text-text-muted">Reference</dt><dd className="font-mono">{receipt.reference}</dd>
            <dt className="text-text-muted">Account</dt><dd>{member.email}</dd>
            <dt className="text-text-muted">Seller</dt><dd>Thee Artistry360 (U) SMC Ltd, Kampala</dd>
          </dl>
        )}
        <button type="button" onClick={() => window.print()} className="btn btn-glass mt-6 w-full">Print or save as PDF</button>
      </Modal>
    </div>
  );
}
