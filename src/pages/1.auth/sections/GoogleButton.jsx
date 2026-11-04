/* Continue With Google (and Apple) */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMember } from "@/store/context/MemberContext";
import { memberProviders, preloadApple, renderGoogleButton } from "@/store/tanstackStore/queries/member";

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

/** Apple's logo, as its sign-in guidelines ask. */
function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.74 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.29-.88-2.3-3.52zM14.2 6.13c.6-.74 1.01-1.75.9-2.77-.87.04-1.94.59-2.56 1.32-.56.64-1.05 1.68-.92 2.67.98.08 1.98-.49 2.58-1.22z" />
    </svg>
  );
}

/**
 * Live sign-in: Google's own button (Google Identity Services draws it; it
 * has to be theirs) and Apple's, each shown only when its id is set in
 * .env.local. Both hand an ID token to the API, which checks it.
 */
function LiveProviders({ next }) {
  const { signInWith } = useMember();
  const navigate = useNavigate();
  const slot = useRef(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const go = async (provider, idToken) => {
    setBusy(provider);
    setError("");
    try {
      await signInWith(provider, idToken);
      navigate(next, { replace: true, viewTransition: true });
    } catch (e) {
      setError(e.message || "Sign-in didn't finish. Try again.");
      setBusy("");
    }
  };
  // The latest handler, without redrawing Google's button each render.
  const onGoogle = useRef(go);
  useEffect(() => {
    onGoogle.current = go;
  });

  useEffect(() => {
    if (!memberProviders.google) return undefined;
    let cleanup;
    let alive = true;
    renderGoogleButton(slot.current, (idToken) => onGoogle.current("google", idToken))
      .then((off) => (alive ? (cleanup = off) : off()))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
      cleanup?.();
    };
  }, []);

  // Apple's popup must open straight from the tap, so its script loads now.
  useEffect(() => {
    if (memberProviders.apple) preloadApple().catch(() => {});
  }, []);

  if (!memberProviders.google && !memberProviders.apple) {
    return <p role="alert" className="text-center text-small font-semibold text-danger">Signing in isn't available yet. Please try again later.</p>;
  }

  return (
    <div className="flex flex-col gap-3" aria-busy={Boolean(busy) || undefined}>
      {memberProviders.google && <div ref={slot} className="flex min-h-12 w-full justify-center" />}
      {memberProviders.apple && (
        <button
          type="button"
          onClick={() => go("apple")}
          disabled={Boolean(busy)}
          // Apple's own black button, kept as raw values per their brand rules.
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-black px-6 text-small font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-[#1a1a1a] disabled:opacity-70"
        >
          <AppleLogo />
          {busy === "apple" ? "Connecting to Apple…" : "Continue with Apple"}
        </button>
      )}
      {busy === "google" && <p className="text-center text-small text-text-secondary">Signing you in…</p>}
      {error && <p role="alert" className="text-center text-small font-semibold text-danger">{error}</p>}
      <p className="text-center text-caption text-text-muted">We only see your name and email, never your password.</p>
    </div>
  );
}

/** One button for sign in and sign up: a Google account needs no password here. Live: Google and Apple. */
export default function GoogleButton({ next }) {
  const { demo } = useMember();
  return demo ? <DemoGoogleButton next={next} /> : <LiveProviders next={next} />;
}

function DemoGoogleButton({ next }) {
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
      // Busy stays on after success, since the page navigates away.
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
        // Google's own white button colours, kept as raw values per their brand rules.
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
