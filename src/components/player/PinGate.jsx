/* Parental PIN Gate */
import { useState } from "react";
import { LockKeyhole } from "lucide-react";

import AgeBadge from "@/components/title/AgeBadge";

/** Stands in for the player when a title is above the parental limit. */
export default function PinGate({ title, limit, onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const ok = await onUnlock(pin);
    setBusy(false);
    if (!ok) {
      setError("That PIN isn't right.");
      setPin("");
    }
  };

  return (
    <div className="grid aspect-video max-h-[calc(100dvh-7rem)] w-full place-items-center bg-black p-6 text-center md:rounded-3xl">
      <form onSubmit={submit} className="flex max-w-sm flex-col items-center gap-4">
        <LockKeyhole className="h-10 w-10 text-brand" aria-hidden="true" />
        <h2 className="text-heading">Parental controls are on</h2>
        <p className="text-small text-text-secondary">
          {title.title} is rated <AgeBadge value={title.ageRating} />, above this account's limit of <AgeBadge value={limit} />. Enter the PIN to watch.
        </p>
        <label className="sr-only" htmlFor="parental-pin">Parental PIN</label>
        <input
          id="parental-pin"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          inputMode="numeric"
          autoComplete="off"
          type="password"
          placeholder="••••"
          autoFocus
          className="w-40 rounded-2xl border border-white/15 bg-surface-card px-4 py-3 text-center text-title tracking-[0.5em] text-text-primary focus:border-brand focus:outline-none"
        />
        {error && <p role="alert" className="text-small font-semibold text-danger">{error}</p>}
        <button type="submit" disabled={pin.length !== 4 || busy} className="btn btn-primary min-h-11 px-6 disabled:opacity-50">Unlock</button>
      </form>
    </div>
  );
}
