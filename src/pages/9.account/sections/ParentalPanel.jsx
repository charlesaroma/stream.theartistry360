/* Parental Controls */
import { useState } from "react";
import { LockKeyhole } from "lucide-react";

import Button from "@/components/ui/Button";
import AgeBadge from "@/components/title/AgeBadge";
import { useAccountSettings } from "@/store/tanstackStore/queries/member";
import { AGE_RATINGS, RATING_ORDER } from "@/utils/ageRatings";
import { cn } from "@/utils/cn";
import { Card, Status } from "./ui";

const pinInput = "w-32 rounded-2xl border border-white/10 bg-surface-primary px-4 py-3 text-center text-subheading tracking-[0.4em] focus:border-brand focus:outline-none";
const digits = (v) => v.replace(/\D/g, "").slice(0, 4);

/**
 * A maximum rating and a 4-digit PIN: anything above the limit asks for the
 * PIN before it plays (once per title, per browser session). Changing the
 * limit or the PIN needs the current PIN.
 */
export default function ParentalPanel() {
  const { settings, saveParental } = useAccountSettings();
  const current = settings.parental;
  const hasPin = Boolean(current.pinHash);
  const [limit, setLimit] = useState(current.maxRating ?? "");
  const [newPin, setNewPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({});
    try {
      await saveParental({ maxRating: limit || null, newPin: newPin || undefined, currentPin });
      setMsg({ ok: limit ? `Saved. Titles above ${limit} now ask for the PIN.` : "Parental controls are off." });
      setNewPin("");
      setCurrentPin("");
    } catch (err) {
      setMsg({ error: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Parental controls" description="Choose the highest rating that plays without a PIN. Handy on a family phone or TV.">
      <form onSubmit={save} className="flex max-w-3xl flex-col gap-6">
        <fieldset>
          <legend className="mb-3 text-caption font-bold uppercase tracking-[0.12em] text-text-secondary">Plays without a PIN</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[["", "Everything", "No limit"], ...RATING_ORDER.slice(0, -1).map((r) => [r, `Up to ${r}`, AGE_RATINGS[r].name])].map(([value, title, sub]) => (
              <label key={value || "off"} className={cn("flex cursor-pointer flex-col gap-1 rounded-2xl border p-3 transition-colors", limit === value ? "border-brand bg-brand/10" : "border-white/10 hover:border-white/25")}>
                <input type="radio" name="limit" value={value} checked={limit === value} onChange={() => setLimit(value)} className="sr-only" />
                <span className="flex items-center gap-2 text-small font-bold">{value ? <AgeBadge value={value} /> : null}{title}</span>
                <span className="text-caption text-text-muted">{sub}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-end gap-4">
          {hasPin && (
            <label>
              <span className="mb-2 block text-caption font-bold uppercase tracking-[0.12em] text-text-secondary">Current PIN</span>
              <input className={pinInput} type="password" inputMode="numeric" autoComplete="off" value={currentPin} onChange={(e) => setCurrentPin(digits(e.target.value))} placeholder="••••" />
            </label>
          )}
          {limit && (
            <label>
              <span className="mb-2 block text-caption font-bold uppercase tracking-[0.12em] text-text-secondary">{hasPin ? "New PIN (optional)" : "Choose a PIN"}</span>
              <input className={pinInput} type="password" inputMode="numeric" autoComplete="off" value={newPin} onChange={(e) => setNewPin(digits(e.target.value))} placeholder="••••" />
            </label>
          )}
          <Button type="submit" loading={busy}><LockKeyhole className="h-4 w-4" aria-hidden="true" /> Save</Button>
        </div>
        <p className="text-caption text-text-muted">The PIN is stored scrambled, never as the four digits. Forgot it? Contact us and we'll reset it once we've checked it's you.</p>
      </form>
      <Status {...msg} />
    </Card>
  );
}
