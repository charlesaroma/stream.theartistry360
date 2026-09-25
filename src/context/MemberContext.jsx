/* Member Context */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { onTokenChange } from "@/api/tokens";
import * as auth from "@/services/authApi";

const MemberContext = createContext(null);

/** The signed-in member (or null) and the actions that change them. */
export function MemberProvider({ children }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    auth.currentMember().then((m) => alive && setMember(m)).finally(() => alive && setLoading(false));
    const off = onTokenChange((realm, token) => realm === "member" && !token && setMember(null));
    return () => {
      alive = false;
      off();
    };
  }, []);

  const run = useCallback(async (fn, ...args) => {
    const m = await fn(...args);
    setMember(m ?? null);
    return m;
  }, []);

  const value = useMemo(
    () => ({
      member,
      loading,
      signIn: (c) => run(auth.signIn, c),
      signUp: (d) => run(auth.signUp, d),
      signOut: () => run(auth.signOut),
      subscribe: (planId) => run(auth.subscribe, planId),
      purchase: (titleId) => run(auth.purchase, titleId),
    }),
    [member, loading, run],
  );

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMember() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error("useMember must be used inside MemberProvider");
  return ctx;
}
