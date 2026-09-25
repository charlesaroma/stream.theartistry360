/* Access Tokens, Per Realm */

/**
 * Two realms, never one slot: a Studio (staff) session and a member session
 * (voters, students) can exist in the same browser at once, and neither may
 * stand in for the other.
 *
 * Held in sessionStorage while the API runs on mocks, so a reload keeps you
 * signed in during development. When the backend lands, tokens move to memory
 * with an httpOnly refresh cookie, as in belioras.
 */

export const REALMS = ["member", "staff"];

const KEY = (realm) => `a360:token:${realm}`;
const listeners = new Set();

export function accessToken(realm) {
  try {
    return window.sessionStorage.getItem(KEY(assertRealm(realm)));
  } catch {
    return null;
  }
}

export function setAccessToken(realm, token) {
  assertRealm(realm);
  try {
    if (token) window.sessionStorage.setItem(KEY(realm), token);
    else window.sessionStorage.removeItem(KEY(realm));
  } catch {
    // Storage unavailable: the session lasts until the next reload.
  }
  listeners.forEach((fn) => fn(realm, token ?? null));
}

export function clearAccessToken(realm) {
  setAccessToken(realm, null);
}

/** Lets an auth context drop its user when a token is cleared elsewhere. */
export function onTokenChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function assertRealm(realm) {
  if (!REALMS.includes(realm)) throw new Error(`Unknown auth realm: ${realm}`);
  return realm;
}
