/* Member Auth Service */
import { ApiError, mockApi } from "@/api/mock";
import { accessToken, clearAccessToken, setAccessToken } from "@/api/tokens";

/**
 * Members only: this site has no staff realm. Mock mode keeps the member in
 * localStorage so a reload stays signed in. The real API uses the same
 * accounts as theartistry360.com (MOU 3D: email, phone or Google).
 */
const KEY = "a360s:member";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
};
const write = (m) => {
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

export function signIn({ email, password }) {
  return mockApi(() => {
    if (!email?.trim() || !password) throw new ApiError("Enter your email and password.", 422);
    const existing = read();
    const member = existing?.email === email.trim().toLowerCase() ? existing : { id: `m_${Date.now().toString(36)}`, name: email.split("@")[0], email: email.trim().toLowerCase(), subscription: null, purchases: [] };
    setAccessToken("member", `mock.member.${member.id}`);
    return write(member);
  }, 400);
}

export function signUp({ name, email, password }) {
  return mockApi(() => {
    if (!name?.trim() || !email?.trim() || !password) throw new ApiError("Please complete every field.", 422);
    const member = { id: `m_${Date.now().toString(36)}`, name: name.trim(), email: email.trim().toLowerCase(), subscription: null, purchases: [] };
    setAccessToken("member", `mock.member.${member.id}`);
    return write(member);
  }, 500);
}

export function signOut() {
  return mockApi(() => {
    clearAccessToken("member");
    write(null);
  }, 0);
}

/**
 * PesaPal stand-ins. The real flow: POST payments/orders returns a PesaPal
 * redirect; the member pays by MoMo, Airtel or card; the IPN webhook confirms;
 * only then does the API mark the plan or purchase. Never trusted from here.
 */
export function subscribe(planId) {
  return mockApi(() => {
    const m = read();
    if (!m) throw new ApiError("Sign in first.", 401);
    const renews = new Date(Date.now() + 30 * 86400_000).toISOString();
    return write({ ...m, subscription: { planId, status: "active", renewsAt: renews } });
  }, 1200);
}

export function purchase(titleId) {
  return mockApi(() => {
    const m = read();
    if (!m) throw new ApiError("Sign in first.", 401);
    return write({ ...m, purchases: [...new Set([...(m.purchases ?? []), titleId])] });
  }, 1200);
}
