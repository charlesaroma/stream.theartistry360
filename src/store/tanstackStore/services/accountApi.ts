/* Member Account Service */
// Everything on /account: payments and receipts, profile, password, the
// plan, parental controls, notifications, and the member's data. The mock
// keeps it in this browser. The real API (auth/me, payments, account/*)
// must check every change against the session, never the request body:
// the member id below comes from the signed-in member only.
import { ApiError, mockApi } from "@/store/tanstackStore/services/api/mock";
import type { Id, RequestOptions } from "@/store/tanstackStore/services/api/types";
import type { Member, MemberSettings, Payment } from "./types";

const K = (what: string, memberId: Id) => `a360s:${what}:${memberId}`;
function read<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, value: T): T {
  try {
    localStorage.setItem(k, JSON.stringify(value));
  } catch {
    // Storage blocked: lasts for this visit.
  }
  return value;
}

/* Payments (PesaPal). Written only by the IPN webhook in the real API. */

export const listPayments = (memberId: Id, { signal }: RequestOptions = {}) =>
  mockApi(() => read<Payment[]>(K("payments", memberId), []), 150, signal);

export function recordPayment(memberId: Id, payment: Omit<Payment, "id" | "reference" | "status" | "paidAt">) {
  const row: Payment = {
    ...payment,
    id: `pay_${Date.now().toString(36)}`,
    reference: `PSP-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    status: "paid",
    paidAt: new Date().toISOString(),
  };
  write(K("payments", memberId), [row, ...read<Payment[]>(K("payments", memberId), [])]);
  return row;
}

/* Settings */

export const DEFAULT_SETTINGS: MemberSettings = {
  parental: { maxRating: null, pinHash: null },
  notifications: { newReleases: true, newEpisodes: true, payments: true, channel: "email" },
};

export const getSettings = (memberId: Id, { signal }: RequestOptions = {}) =>
  mockApi(() => {
    const s = read<Partial<MemberSettings>>(K("settings", memberId), {});
    return { parental: { ...DEFAULT_SETTINGS.parental, ...s.parental }, notifications: { ...DEFAULT_SETTINGS.notifications, ...s.notifications } };
  }, 0, signal);

const saveSettings = (memberId: Id, next: MemberSettings) => write(K("settings", memberId), next);

export const updateNotifications = (memberId: Id, patch: Partial<MemberSettings["notifications"]>) =>
  mockApi(async () => {
    const s = await getSettings(memberId);
    return saveSettings(memberId, { ...s, notifications: { ...s.notifications, ...patch } });
  }, 150);

/**
 * The parental PIN is stored hashed, salted with the member id, never as the
 * four digits. (The real API hashes it server-side with a slow hash.)
 */
async function hashPin(memberId: Id, pin: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${memberId}:parental:${pin}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPin(memberId: Id, pin: string) {
  const s = await getSettings(memberId);
  return Boolean(s.parental.pinHash) && s.parental.pinHash === (await hashPin(memberId, pin));
}

/** Set or change the limit. Once a PIN exists, changing anything needs it. */
export function updateParental(memberId: Id, { maxRating, newPin, currentPin }: { maxRating: string | null; newPin?: string; currentPin?: string }) {
  return mockApi(async () => {
    const s = await getSettings(memberId);
    if (s.parental.pinHash && !(await verifyPin(memberId, currentPin ?? ""))) throw new ApiError("That PIN isn't right.", 403);
    if (newPin !== undefined && !/^\d{4}$/.test(newPin)) throw new ApiError("The PIN is 4 digits.", 422);
    if (maxRating && !newPin && !s.parental.pinHash) throw new ApiError("Set a 4-digit PIN to lock titles above the limit.", 422);
    const pinHash = maxRating ? (newPin ? await hashPin(memberId, newPin) : s.parental.pinHash) : null;
    return saveSettings(memberId, { ...s, parental: { maxRating, pinHash } });
  }, 250);
}

/* Profile and sign-in */

const MEMBER_KEY = "a360s:member";
const saveMember = (m: Member) => write(MEMBER_KEY, m);

export function updateProfile(member: Member | null, { name, phone }: { name: string; phone: string }) {
  return mockApi(() => {
    if (!member) throw new ApiError("Sign in first.", 401);
    if (!name.trim()) throw new ApiError("Enter your name.", 422);
    if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) throw new ApiError("Enter a phone number, e.g. +256 772 000 000.", 422);
    return saveMember({ ...member, name: name.trim().slice(0, 60), phone: phone.trim() });
  }, 300);
}

/** A new email only takes effect from the link sent to it. */
export function requestEmailChange(member: Member | null, email: string) {
  return mockApi(() => {
    if (!member) throw new ApiError("Sign in first.", 401);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError("Enter a valid email.", 422);
    return saveMember({ ...member, pendingEmail: email.trim().toLowerCase() });
  }, 400);
}

export function changePassword(member: Member | null, { current, next }: { current: string; next: string }) {
  return mockApi(() => {
    if (!member) throw new ApiError("Sign in first.", 401);
    if (member.provider !== "google" && !current) throw new ApiError("Enter your current password.", 422);
    if (next.length < 8) throw new ApiError("Use at least 8 characters.", 422);
    return saveMember({ ...member, provider: "email" });
  }, 500);
}

/* Plan */

export function setCancelAtPeriodEnd(member: Member | null, cancel: boolean) {
  return mockApi(() => {
    if (!member?.subscription) throw new ApiError("There's no active plan.", 409);
    return saveMember({ ...member, subscription: { ...member.subscription, cancelAtPeriodEnd: cancel } });
  }, 500);
}

/* Your data (Data Protection and Privacy Act 2019) */

const memberKeys = (memberId: Id) => {
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith("a360s:") && k.endsWith(`:${memberId}`));
  } catch {
    return [];
  }
};

/** Everything held about the member, as one JSON document to download. */
export const exportData = (member: Member) =>
  mockApi(() => {
    const data: Record<string, unknown> = {};
    for (const k of memberKeys(member.id)) data[k.split(":")[1]] = read(k, null);
    const comments: unknown[] = [];
    try {
      for (const k of Object.keys(localStorage).filter((x) => x.startsWith("a360s:comments:"))) {
        for (const c of read<{ author: { id: Id } }[]>(k, [])) if (c.author.id === member.id) comments.push({ titleId: k.split(":")[2], ...c });
      }
    } catch {
      // Storage unreadable: export what we have.
    }
    return { exportedAt: new Date().toISOString(), account: member, ...data, comments };
  }, 300);

export const clearHistory = (memberId: Id) =>
  mockApi(() => {
    for (const what of ["progress", "episodes"]) {
      try {
        localStorage.removeItem(K(what, memberId));
      } catch {
        // nothing to clear
      }
    }
  }, 200);

/** Deletes the account and everything tied to it. The caller signs out. */
export const deleteAccount = (member: Member | null, confirmText: string) =>
  mockApi(() => {
    if (!member) throw new ApiError("Sign in first.", 401);
    if (confirmText.trim().toUpperCase() !== "DELETE") throw new ApiError('Type DELETE to confirm.', 422);
    for (const k of memberKeys(member.id)) {
      try {
        localStorage.removeItem(k);
      } catch {
        // already gone
      }
    }
  }, 600);
