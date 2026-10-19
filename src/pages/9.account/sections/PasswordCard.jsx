/* Password Card */
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Circle, Eye, EyeOff } from "lucide-react";

import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberContext";
import { cn } from "@/utils/cn";
import { Card, Status } from "./ui";

// Matches the minimum the sign-up and reset schemas enforce.
const MIN = 8;
const input = "w-full rounded-2xl border border-white/10 bg-surface-primary py-3 pl-4 pr-13 text-body text-text-primary focus:border-brand focus:outline-none";
const label = "text-caption font-bold uppercase tracking-[0.12em] text-text-secondary";

/** A password box with a show / hide eye, so a typo is seen instead of needing a second box. */
function PasswordInput({ id, value, onChange, autoComplete, describedBy, autoFocus }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input id={id} className={input} type={shown ? "text" : "password"} value={value} autoComplete={autoComplete} aria-describedby={describedBy} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-text-muted transition-colors hover:bg-white/8 hover:text-text-primary"
      >
        {shown ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

function Rule({ met, children }) {
  return (
    <li className={cn("flex items-center gap-2 text-small transition-colors", met ? "text-success" : "text-text-muted")}>
      {met ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Circle className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
      {/* The tick and circle are hidden from screen readers, so say the state in words. */}
      <span className="sr-only">{met ? "(done)" : "(not yet)"}</span>
    </li>
  );
}

/**
 * Change (or, for a Google account, set) the password. Closed by default: a
 * row with the button, like Email. Open: one column, current then new, each
 * with show / hide, and the rules ticking off as you type. Save waits for
 * them; saving signs out the other devices.
 */
export default function PasswordCard() {
  const { member, changePassword } = useMember();
  // A Google account has no current password to enter, so the rules below skip it.
  const google = member.provider === "google";
  const ids = { current: useId(), next: useId(), rules: useId() };
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({});

  // Live rule checks; Save stays disabled until every one is met.
  const long = pw.next.length >= MIN;
  const differs = google || (pw.next.length > 0 && pw.next !== pw.current);
  const ready = long && differs && (google || pw.current.length > 0);

  // Closing clears both boxes so a password never lingers on screen.
  const close = () => {
    setOpen(false);
    setPw({ current: "", next: "" });
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setMsg({});
    try {
      await changePassword({ current: pw.current, next: pw.next });
      close();
      setMsg({ ok: google ? "Password set. You can now also sign in with your email." : "Password saved. Your other devices are signed out." });
    } catch (err) {
      setMsg({ error: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Password" description={google ? "You sign in with Google. Set a password to also sign in with your email." : "Changing it signs you out on your other devices."}>
      {!open ? (
        <>
          <div className="flex max-w-2xl flex-wrap items-center justify-between gap-3">
            {/* Closed: dots stand in for a set password, never its real length. */}
            <p className="text-body text-text-secondary">{google ? "No password yet" : <span aria-label="Password set" className="tracking-[0.3em]">••••••••</span>}</p>
            <Button variant="glass" onClick={() => { setMsg({}); setOpen(true); }}>{google ? "Set password" : "Change password"}</Button>
          </div>
          <Status {...msg} />
        </>
      ) : (
        <form onSubmit={submit} className="flex max-w-md flex-col gap-5">
          {!google && (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={ids.current} className={label}>Current password</label>
                <Link to="/forgot-password" className="text-small font-semibold text-brand hover:underline">Forgot it?</Link>
              </div>
              <PasswordInput id={ids.current} value={pw.current} autoComplete="current-password" autoFocus onChange={(current) => setPw({ ...pw, current })} />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor={ids.next} className={label}>New password</label>
            <PasswordInput id={ids.next} value={pw.next} autoComplete="new-password" describedBy={ids.rules} autoFocus={google} onChange={(next) => setPw({ ...pw, next })} />
            {/* Rules: linked to the input with aria-describedby and announced as they tick off. */}
            <ul id={ids.rules} className="mt-1 flex flex-col gap-1.5" aria-live="polite">
              <Rule met={long}>At least {MIN} characters</Rule>
              {!google && <Rule met={differs}>Different from your current password</Rule>}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={busy} disabled={!ready}>{google ? "Set password" : "Save password"}</Button>
            <Button variant="ghost" onClick={close} disabled={busy}>Cancel</Button>
          </div>
          <Status {...msg} />
        </form>
      )}
    </Card>
  );
}
