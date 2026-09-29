/* Continue With Google */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMember } from "@/store/context/MemberContext";

/** Google's four-colour "G", as their sign-in guidelines ask. */
function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

/** One button for sign in and sign up: a Google account needs no password here. */
export default function GoogleButton({ next }) {
  const { signInWithGoogle } = useMember();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const go = async () => {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle(next);
      navigate(next, { replace: true, viewTransition: true });
    } catch (e) {
      setError(e.message || "Google sign-in didn't finish. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={go}
        disabled={busy}
        aria-busy={busy || undefined}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-6 text-small font-semibold text-[#1f1f1f] transition-colors hover:bg-[#f2f2f2] disabled:opacity-70"
      >
        <GoogleG />
        {busy ? "Connecting to Google…" : "Continue with Google"}
      </button>
      {error && <p role="alert" className="text-center text-small font-semibold text-danger">{error}</p>}
    </div>
  );
}

/** The "or" rule between Google and the email form. */
export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-caption uppercase tracking-widest text-text-muted" role="separator">
      <span className="h-px flex-1 bg-white/10" />
      or
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
