/* Member Auth Service */
import { apiRoot, useMockApi } from "@/store/tanstackStore/services/api/config";
import { ApiError, mockApi } from "@/store/tanstackStore/services/api/mock";
import { accessToken, clearAccessToken, setAccessToken } from "@/store/tanstackStore/services/api/tokens";
import type { Id } from "@/store/tanstackStore/services/api/types";
import type { Member } from "./types";
import { recordPayment } from "./accountApi";
import { streamingPlansSeed } from "@/data/streamingPlans";
import { streamingTitlesSeed } from "@/data/streamingTitles";

/**
 * Members only: this site has no admin realm, and it is the only place the
 * public signs in (theartistry360.com has no public login). Mock mode keeps
 * the member in localStorage so a reload stays signed in. The real API uses
 * member accounts (MOU 3D: email, phone or Google).
 */
const KEY = "a360s:member";

const read = (): Member | null => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null") as Member | null;
  } catch {
    return null;
  }
};
const write = <T extends Member | null>(m: T): T => {
  try {
    if (m) localStorage.setItem(KEY, JSON.stringify(m));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the session lasts for this tab only.
  }
  return m;
};

export function currentMember() {
  return mockApi(() => (accessToken("member") || read() ? read() : null), 0);
}

export function signIn({ email, password }: { email: string; password: string }) {
  return mockApi(() => {
    if (!email?.trim() || !password) throw new ApiError("Enter your email and password.", 422);
    const existing = read();
    const member: Member =
      existing?.email === email.trim().toLowerCase()
        ? existing
        : { id: `m_${Date.now().toString(36)}`, name: email.split("@")[0], email: email.trim().toLowerCase(), provider: "email", subscription: null, purchases: [] };
    setAccessToken("member", `mock.member.${member.id}`);
    return write(member);
  }, 400);
}

export function signUp({ name, email, password }: { name: string; email: string; password: string }) {
  return mockApi(() => {
    if (!name?.trim() || !email?.trim() || !password) throw new ApiError("Please complete every field.", 422);
    const member: Member = { id: `m_${Date.now().toString(36)}`, name: name.trim(), email: email.trim().toLowerCase(), provider: "email", subscription: null, purchases: [] };
    setAccessToken("member", `mock.member.${member.id}`);
    return write(member);
  }, 500);
}

/**
 * Continue with Google. The real flow is server-side (authorization code with
 * PKCE and a state check): the browser goes to the API, the API talks to
 * Google, sets the refresh cookie and sends the member back to `next`. No
 * Google token ever reaches this page. Mock mode signs in a demo account.
 */
export function signInWithGoogle(next: string) {
  if (!useMockApi) {
    window.location.assign(`${apiRoot}/auth/member/google?next=${encodeURIComponent(next)}`);
    return new Promise<never>(() => {}); // the page is leaving
  }
  return mockApi(() => {
    const email = "google.member@gmail.com";
    const existing = read();
    const member: Member = existing?.email === email ? existing : { id: `m_${Date.now().toString(36)}`, name: "Google Member", email, provider: "google", subscription: null, purchases: [] };
    setAccessToken("member", `mock.member.${member.id}`);
    return write(member);
  }, 700);
}

/**
 * Forgot password: always the same answer, whether or not the email has an
 * account, so the form can't be used to find out who is a member. The API
 * emails a single-use link (30 minutes) and rate-limits per email and IP.
 */
export function requestPasswordReset({ email }: { email: string }) {
  return mockApi(() => {
    if (!email?.trim()) throw new ApiError("Enter your email.", 422);
    return { sent: true as const };
  }, 600);
}

/** Sets a new password from the emailed link. The API rejects used or expired tokens. */
export function resetPassword({ token, password }: { token: string; password: string }) {
  return mockApi(() => {
    if (!token) throw new ApiError("This reset link is incomplete. Request a new one.", 400);
    if (!password || password.length < 8) throw new ApiError("Use at least 8 characters.", 422);
    return { reset: true as const };
  }, 600);
}

export function signOut() {
  return mockApi(() => {
    clearAccessToken("member");
    return write(null);
  }, 0);
}

/**
 * PesaPal stand-ins. The real flow: POST payments/orders returns a PesaPal
 * redirect; the member pays by MoMo, Airtel or card; the IPN webhook confirms;
 * only then does the API mark the plan or purchase. Never trusted from here.
 */
const DAYS = { month: 30, quarter: 91, year: 365 } as const;

export function subscribe(planId: Id, method = "Mobile money") {
  return mockApi(() => {
    const m = read();
    if (!m) throw new ApiError("Sign in first.", 401);
    const plan = streamingPlansSeed.find((p) => p.id === planId);
    const renews = new Date(Date.now() + DAYS[(plan?.interval ?? "month") as keyof typeof DAYS] * 86400_000).toISOString();
    recordPayment(m.id, { kind: "subscription", planId, description: `${plan?.name ?? "Plan"} subscription`, amountUGX: plan?.priceUGX ?? 0, method });
    return write({ ...m, subscription: { planId, status: "active" as const, renewsAt: renews } });
  }, 1200);
}

export function purchase(titleId: Id, method = "Mobile money") {
  return mockApi(() => {
    const m = read();
    if (!m) throw new ApiError("Sign in first.", 401);
    const title = streamingTitlesSeed.find((t) => t.id === titleId);
    recordPayment(m.id, { kind: "purchase", titleId, description: `Watch: ${title?.title ?? "a title"} (48 hours)`, amountUGX: title?.access?.priceUGX ?? 0, method });
    return write({ ...m, purchases: [...new Set([...(m.purchases ?? []), titleId])] });
  }, 1200);
}
