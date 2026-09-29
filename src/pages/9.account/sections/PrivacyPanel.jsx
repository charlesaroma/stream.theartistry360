/* Privacy And Your Data */
import { useState } from "react";
import { Download, History, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberContext";
import { useAccountSettings } from "@/store/tanstackStore/queries/member";
import { Card, Status } from "./ui";

/**
 * Your data under Uganda's Data Protection and Privacy Act 2019: download a
 * copy, clear what you've watched, or delete the account.
 */
export default function PrivacyPanel() {
  const { member, deleteAccount } = useMember();
  const { exportData, clearHistory } = useAccountSettings();
  const [msg, setMsg] = useState({});
  const [clearing, setClearing] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const download = async () => {
    const data = await exportData(member);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `artistry360-my-data-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ download: { ok: "Downloaded." } });
  };

  const clear = async () => {
    await clearHistory();
    setClearing(false);
    setMsg({ history: { ok: "Watch history cleared. Continue Watching is empty now." } });
  };

  const remove = async (e) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await deleteAccount(confirmText);
    } catch (err) {
      setMsg({ delete: { error: err.message } });
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Download your data" description="A copy of everything we hold about you: account, plan, payments, My List, what you've watched, ratings, comments and settings.">
        <Button variant="glass" onClick={download}><Download className="h-4 w-4" aria-hidden="true" /> Download my data</Button>
        <Status {...msg.download} />
      </Card>

      <Card title="Watch history" description="Clears where you stopped in every film and episode. My List and ratings stay.">
        {clearing ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-small text-text-secondary">Clear all of it? This can't be undone.</span>
            <Button variant="glass" onClick={() => setClearing(false)}>Keep it</Button>
            <Button onClick={clear}>Clear history</Button>
          </div>
        ) : (
          <Button variant="glass" onClick={() => setClearing(true)}><History className="h-4 w-4" aria-hidden="true" /> Clear watch history</Button>
        )}
        <Status {...msg.history} />
      </Card>

      <Card tone="danger" title="Delete account" description="Deletes your account and everything tied to it. Payment records are kept only as long as the law requires, without your details. An active plan stops immediately, with no refund for the rest of the period.">
        <form onSubmit={remove} className="flex max-w-xl flex-wrap items-end gap-3">
          <label className="min-w-56 flex-1">
            <span className="mb-2 block text-caption font-bold uppercase tracking-[0.12em] text-text-secondary">Type DELETE to confirm</span>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" className="w-full rounded-2xl border border-danger/30 bg-surface-primary px-4 py-3 text-body focus:border-danger focus:outline-none" />
          </label>
          <button type="submit" disabled={confirmText.trim().toUpperCase() !== "DELETE" || deleting} className="btn min-h-12 bg-danger px-6 text-white hover:brightness-110 disabled:opacity-40">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete my account
          </button>
        </form>
        <Status {...msg.delete} />
      </Card>
    </div>
  );
}
