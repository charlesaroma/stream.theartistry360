/* Member Auth Service */
import { useMockApi } from "@/store/tanstackStore/services/api/config";
import { http, refreshRealm, registerRefresher } from "@/store/tanstackStore/services/api/client";
import { ApiError, mockApi } from "@/store/tanstackStore/services/api/mock";
import { routes } from "@/store/tanstackStore/services/api/routes";
import { accessToken, clearAccessToken, setAccessToken } from "@/store/tanstackStore/services/api/tokens";
import type { Id } from "@/store/tanstackStore/services/api/types";
import type { Member } from "./types";
import { recordPayment } from "./accountApi";
import { appleSignIn } from "./identityProviders";
import { streamingPlansSeed } from "@/data/streamingPlans";
import { streamingTitlesSeed } from "@/data/streamingTitles";
import { ppvStage } from "@/utils/access";

/**
 * Members only: this site has no admin realm. The same member accounts as
 * voting on theartistry360.com: Google or Apple vouches for the member
 * (`POST auth/google`, `auth/apple`), so there is no password to keep. The
 * access token is held in memory and the httpOnly refresh cookie brings it
 * back after a reload. What the member may watch (plan, rentals) comes with
 * them, from `GET library/access`.
 *
 * Mock mode keeps the member in localStorage so a reload stays signed in.
 */
const KEY = "a360s:member";

/* Live */

interface MemberUser {
  id: Id;
  name: string;
  email: string;
  provider?: "google" | "apple";
}
interface LiveBody {
  accessToken: string;
  expiresIn: number;
  member: MemberUser;
}
interface Access {
  subscription: Member["subscription"];
  purchases: Id[];
}

// A hint, not a secret: whether this browser has a session worth refreshing,
// so a visitor who never signed in doesn't ask the API on every load.
const HINT = "a360s:member:signed-in";
const setHint = (on: boolean) => {
  try {
    if (on) localStorage.setItem(HINT, "1");
    else localStorage.removeItem(HINT);
  } catch {
    // Storage unavailable: each load asks the API instead.
  }
};
const hasHint = () => {
  try {
    return localStorage.getItem(HINT) === "1";
  } catch {
    return true;
  }
};

let live: Member | null = null;
const toMember = (u: MemberUser, a: Access): Member => ({ id: u.id, name: u.name, email: u.email, provider: u.provider === "apple" ? "apple" : "google", subscription: a.subscription, purchases: a.purchases });

const forget = () => {
  live = null;
  setHint(false);
  clearAccessToken("member");
};

/** Keep what a sign-in or refresh answered, with what the member may watch. */
async function accept(body: LiveBody) {
  setAccessToken("member", body.accessToken);
  setHint(true);
  const access = await http.get<Access>(routes.access, { refresh: false });
  live = toMember(body.member, access);
  return live;
}

/** Trade the refresh cookie for a new access token. False when the session has ended. */
async function refresh() {
  try {
    await accept(await http.post<LiveBody>(routes.memberRefresh, undefined, { refresh: false }));
    return true;
  } catch (error) {
    // Offline or a server fault keeps the member; a refusal signs them out.
    if (error instanceof ApiError && error.status > 0 && error.status < 500) forget();
    return false;
  }
}
if (!useMockApi) registerRefresher(refresh);

/** The account pages changed the member (name, plan): keep the change for the next read. */
export function rememberMember(m: Member) {
  if (!useMockApi) live = m;
  return m;
}

/** After a payment or a cancel: what the member may watch now. */
export async function refreshAccess(): Promise<Member | null> {
  if (useMockApi) return read();
  if (!live) return null;
  const access = await http.get<Access>(routes.access);
  live = { ...live, ...access };
  return live;
}

/**
 * Sign in with Google (the ID token its button gave the page) or Apple (its
 * popup opens here). Apple sends the name only the first time; it's passed on.
 */
export async function signInWith(provider: "google" | "apple", idToken?: string): Promise<Member> {
  if (useMockApi) return signInWithGoogle("/") as Promise<Member>;
  const credential = provider === "apple" ? await appleSignIn() : { idToken };
  return accept(await http.post<LiveBody>(provider === "apple" ? routes.memberApple : routes.memberGoogle, credential, { refresh: false }));
}

/* Mock */

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

export function currentMember(): Promise<Member | null> {
  if (!useMockApi) {
    if (accessToken("member") && live) return Promise.resolve(live);
    if (!hasHint()) return Promise.resolve(null);
    return refreshRealm().then((ok) => (ok ? live : null));
  }
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

/** Mock "Continue with Google": signs in a demo account. Live sign-in is signInWith. */
export function signInWithGoogle(_next: string) {
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

/** Signed out here whatever the network says; the server clears the cookie when it hears. */
export function signOut() {
  if (!useMockApi) return http.post(routes.memberLogout, undefined, { refresh: false }).catch(() => {}).then(() => { forget(); return null; });
  return mockApi(() => {
    clearAccessToken("member");
    return write(null);
  }, 0);
}

/** Every device signs out, this one too. */
export function signOutEverywhere() {
  if (!useMockApi) return http.post(routes.signOutEverywhere).catch(() => {}).then(() => { forget(); return null; });
  return signOut();
}

/**
 * Paying. Live: POST payments/orders answers with PesaPal's page and the
 * member goes there (MoMo, Airtel or card); PesaPal sends them back to
 * /payment/return, which waits for the API to confirm. Only PesaPal's word
 * (its IPN, or the API's own check) starts a plan or a rental, never this page.
 */
export const CHECKOUT_KEY = "a360s:checkout";

// expectedPriceUGX: the price the page showed; the API answers 409 price_changed if it has moved on.
export type CheckoutFor = { kind: "subscription"; planId: Id } | { kind: "ppv"; titleId: Id; expectedPriceUGX?: number };

/**
 * Starts paying: → { reference, redirectUrl }, PesaPal's page, which the
 * site shows in its own PesaPal window (components/payments/PesapalCheckout).
 * Where to go afterwards is kept for the "Open in a new tab" route, which
 * ends on /payment/return in a full tab.
 */
export async function startCheckout(body: CheckoutFor, next: string) {
  const order = await http.post<{ reference: string; redirectUrl: string }>(routes.orders, body);
  try {
    sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify({ reference: order.reference, next, kind: body.kind }));
  } catch {
    // Storage blocked: the return page still finds the order from PesaPal's link.
  }
  return order;
}

/** A full-page checkout (the API's answer is followed in this tab). */
async function checkout(body: CheckoutFor, next: string): Promise<never> {
  const { redirectUrl } = await startCheckout(body, next);
  window.location.assign(redirectUrl);
  return new Promise<never>(() => {}); // the page is leaving
}

/** The stand-ins below grant at once (mock); `next` is where a live checkout returns to. */
const DAYS = { week: 7, month: 30, quarter: 91, year: 365 } as const;

export function subscribe(planId: Id, method = "Mobile money", next = "/") {
  if (!useMockApi) return checkout({ kind: "subscription", planId }, next);
  return mockApi(() => {
    const m = read();
    if (!m) throw new ApiError("Sign in first.", 401);
    const plan = streamingPlansSeed.find((p) => p.id === planId);
    const renews = new Date(Date.now() + DAYS[(plan?.interval ?? "month") as keyof typeof DAYS] * 86400_000).toISOString();
    recordPayment(m.id, { kind: "subscription", planId, description: `${plan?.name ?? "Plan"} subscription`, amountUGX: plan?.priceUGX ?? 0, method });
    return write({ ...m, subscription: { planId, status: "active" as const, renewsAt: renews } });
  }, 1200);
}

export function purchase(titleId: Id, method = "Mobile money", next = `/watch/${titleId}`) {
  if (!useMockApi) return checkout({ kind: "ppv", titleId }, next);
  return mockApi(() => {
    const m = read();
    if (!m) throw new ApiError("Sign in first.", 401);
    const title = streamingTitlesSeed.find((t) => t.id === titleId);
    recordPayment(m.id, { kind: "purchase", titleId, description: `Watch: ${title?.title ?? "a title"} (24 hours)`, amountUGX: ppvStage(title?.access).priceUGX, method });
    return write({ ...m, purchases: [...new Set([...(m.purchases ?? []), titleId])] });
  }, 1200);
}
