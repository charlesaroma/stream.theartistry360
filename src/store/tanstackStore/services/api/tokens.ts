/* Access Tokens, Per Realm */

/**
 * The member's access token. One realm only on this site (see types.ts), but
 * the realm is still named on every call so the transport matches
 * theartistry360.com's and a second realm could never share this slot.
 *
 * Held in sessionStorage while the API runs on mocks, so a reload keeps you
 * signed in during development. When the backend lands, the token moves to
 * memory with an httpOnly refresh cookie.
 */

import type { Realm } from "./types";

export const REALMS: readonly Realm[] = ["member"];

type TokenListener = (realm: Realm, token: string | null) => void;

const KEY = (realm: Realm) => `a360:token:${realm}`;
const listeners = new Set<TokenListener>();

export function accessToken(realm: Realm) {
  try {
    return window.sessionStorage.getItem(KEY(assertRealm(realm)));
  } catch {
    return null;
  }
}

export function setAccessToken(realm: Realm, token: string | null) {
  assertRealm(realm);
  try {
    if (token) window.sessionStorage.setItem(KEY(realm), token);
    else window.sessionStorage.removeItem(KEY(realm));
  } catch {
    // Storage unavailable: the session lasts until the next reload.
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
