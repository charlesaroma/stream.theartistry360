/* Member Context */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { onTokenChange } from "@/store/tanstackStore/services/api/tokens";
import * as auth from "@/store/tanstackStore/services/authApi";
import { useMockApi } from "@/store/tanstackStore/services/api/config";
import { realmRoot } from "@/store/tanstackStore/queries/keys";

const MemberContext = createContext(null);

/** The signed-in member (or null) and the actions that change them. */
export function MemberProvider({ children }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Whenever who is signed in changes, every ["member", …] entry goes: the
  // guest's list never mixes with an account's, and nothing of one account
  // is left in memory for the next.
  const forget = useCallback(() => queryClient.removeQueries({ queryKey: realmRoot("member") }), [queryClient]);

  useEffect(() => {
    let alive = true;
    auth.currentMember().then((m) => alive && setMember(m)).finally(() => alive && setLoading(false));
    const off = onTokenChange((realm, token) => {
      if (realm !== "member" || token) return;
      setMember(null);
      forget();
    });
    return () => {
      alive = false;
      off();
    };
  }, [forget]);

  const run = useCallback(async (fn, ...args) => {
    const m = await fn(...args);
    setMember(m ?? null);
    return m;
  }, []);

  // Sign-in and sign-out change the account; subscribe and purchase do not.
  const switchAccount = useCallback(async (fn, ...args) => {
    const m = await run(fn, ...args);
    forget();
    return m;
  }, [run, forget]);

  const value = useMemo(
    () => ({
      member,
      loading,
      signIn: (c) => switchAccount(auth.signIn, c),
      signUp: (d) => switchAccount(auth.signUp, d),
      signInWithGoogle: (next) => switchAccount(auth.signInWithGoogle, next),
      // Password reset doesn't sign anyone in; the member signs in afterwards.
      requestPasswordReset: auth.requestPasswordReset,
      resetPassword: auth.resetPassword,
      /** Mocks on: pages may show demo shortcuts (e.g. the reset link). */
      demo: useMockApi,
      signOut: () => switchAccount(auth.signOut),
      subscribe: (planId) => run(auth.subscribe, planId),
      purchase: (titleId) => run(auth.purchase, titleId),
    }),
    [member, loading, run, switchAccount],
  );

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMember() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error("useMember must be used inside MemberProvider");
  return ctx;
}
