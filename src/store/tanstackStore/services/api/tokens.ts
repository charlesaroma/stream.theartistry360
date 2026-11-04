/* Access Tokens, Per Realm */

/**
 * The member's access token. One realm only on this site (see types.ts), but
 * the realm is still named on every call so the transport matches
 * theartistry360.com's and a second realm could never share this slot.
 *
 * Against the API the token lives in memory only, and the httpOnly refresh
 * cookie (a360_rt_member) brings a new one after a reload. On mocks it sits
 * in sessionStorage, so a reload keeps you signed in during development.
 */

import { useMockApi } from "./config";
import type { Realm } from "./types";

export const REALMS: readonly Realm[] = ["member"];

type TokenListener = (realm: Realm, token: string | null) => void;

const KEY = (realm: Realm) => `a360s:token:${realm}`;
const listeners = new Set<TokenListener>();
const inMemory = new Map<Realm, string>();

export function accessToken(realm: Realm) {
  assertRealm(realm);
  if (!useMockApi) return inMemory.get(realm) ?? null;
  try {
    return window.sessionStorage.getItem(KEY(realm));
  } catch {
    return null;
  }
}

export function setAccessToken(realm: Realm, token: string | null) {
  assertRealm(realm);
  if (!useMockApi) {
    if (token) inMemory.set(realm, token);
    else inMemory.delete(realm);
  } else {
    try {
      if (token) window.sessionStorage.setItem(KEY(realm), token);
      else window.sessionStorage.removeItem(KEY(realm));
    } catch {
      // Storage unavailable: the session lasts until the next reload.
    }
  }
  listeners.forEach((fn) => fn(realm, token ?? null));
}

export function clearAccessToken(realm: Realm) {
  setAccessToken(realm, null);
}

/** Lets an auth context drop its user when a token is cleared elsewhere. */
export function onTokenChange(fn: TokenListener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function assertRealm(realm: Realm) {
  if (!REALMS.includes(realm)) throw new Error(`Unknown auth realm: ${realm}`);
  return realm;
}
