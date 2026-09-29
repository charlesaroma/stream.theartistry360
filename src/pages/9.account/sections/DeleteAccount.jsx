/* Delete Account */
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { useMember } from "@/store/context/MemberContext";
import { Card, Status } from "./ui";

/** Closes the account for good, after typing DELETE. */
export default function DeleteAccount() {
  const { deleteAccount } = useMember();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const remove = async (e) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await deleteAccount(confirmText);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
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
      <Status error={error} />
    </Card>
  );
}
