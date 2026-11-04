/* Google And Apple Sign-In */
import { ApiError } from "./api/mock";

/**
 * The providers' own scripts give the page an ID token, which the API checks
 * (`POST auth/google`, `POST auth/apple`). Google's has to be its own button
 * (Google Identity Services draws it); Apple's opens a popup from our button.
 * Each provider shows only when its id is set in .env.local:
 * VITE_GOOGLE_CLIENT_ID, VITE_APPLE_SERVICES_ID (docs/06-backend-integration.md).
 */

const env = (key: string) => {
  const value: unknown = import.meta.env?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
};

const GOOGLE_CLIENT_ID = env("VITE_GOOGLE_CLIENT_ID");
const APPLE_SERVICES_ID = env("VITE_APPLE_SERVICES_ID");

/** Which providers this build can sign members in with. */
export const memberProviders = { google: Boolean(GOOGLE_CLIENT_ID), apple: Boolean(APPLE_SERVICES_ID) };

const scripts = new Map<string, Promise<void>>();

/** Load a provider's script once; later calls share the same promise. */
function loadScript(src: string) {
  let pending = scripts.get(src);
  if (!pending) {
    pending = new Promise<void>((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = src;
      tag.async = true;
      tag.onload = () => resolve();
      tag.onerror = () => {
        scripts.delete(src);
        tag.remove();
        reject(new ApiError("Sign-in couldn't load. Check your connection and try again.", 0));
      };
      document.head.appendChild(tag);
    });
    scripts.set(src, pending);
  }
  return pending;
}

/* Google */

interface GoogleId {
  initialize(options: { client_id: string; callback: (r: { credential?: string }) => void; ux_mode?: "popup"; use_fedcm_for_button?: boolean }): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
}
const googleId = () => (window as unknown as { google?: { accounts?: { id?: GoogleId } } }).google?.accounts?.id;

// Google Identity Services takes one callback for the page; the button showing now receives it.
let onGoogleCredential: ((idToken: string) => void) | null = null;
let googleReady: Promise<GoogleId> | null = null;

function loadGoogle() {
  googleReady ??= loadScript("https://accounts.google.com/gsi/client").then(() => {
    const id = googleId();
    if (!id) throw new ApiError("Google sign-in couldn't load. Please try again.", 0);
    id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: "popup",
      use_fedcm_for_button: true,
      callback: ({ credential }) => credential && onGoogleCredential?.(credential),
    });
    return id;
  });
  googleReady.catch(() => (googleReady = null));
  return googleReady;
}

/**
 * Draw Google's own "Continue with Google" button into `el`. A press hands
 * `onCredential` the ID token. Returns a cleanup for when the button leaves.
 */
export async function renderGoogleButton(el: HTMLElement, onCredential: (idToken: string) => void) {
  const id = await loadGoogle();
  onGoogleCredential = onCredential;
  el.replaceChildren();
  id.renderButton(el, {
    type: "standard",
    theme: "filled_black",
    size: "large",
    shape: "pill",
    text: "continue_with",
    logo_alignment: "center",
    width: Math.min(400, Math.max(200, Math.round(el.clientWidth))),
  });
  return () => {
    if (onGoogleCredential === onCredential) onGoogleCredential = null;
  };
}

/* Apple */

interface AppleAuth {
  init(options: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }): void;
  signIn(): Promise<{ authorization: { id_token: string }; user?: { name?: { firstName?: string; lastName?: string } } }>;
}
const appleAuth = () => (window as unknown as { AppleID?: { auth?: AppleAuth } }).AppleID?.auth;

let appleReady: Promise<AppleAuth> | null = null;

/** Load Apple's script ahead of the press: the popup must open straight from the tap, or browsers block it. */
export function preloadApple() {
  appleReady ??= loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js").then(() => {
    const auth = appleAuth();
    if (!auth) throw new ApiError("Apple sign-in couldn't load. Please try again.", 0);
    // The return URL must be one registered on the Services ID; with a popup, Apple only checks it.
    auth.init({ clientId: APPLE_SERVICES_ID, scope: "name email", redirectURI: window.location.origin + window.location.pathname, usePopup: true });
    return auth;
  });
  appleReady.catch(() => (appleReady = null));
  return appleReady;
}

/** Open Apple's sign-in popup. Its name comes only on the first sign-in, so it's passed on for the account. */
export async function appleSignIn(): Promise<{ idToken: string; name?: string }> {
  const auth = await preloadApple();
  try {
    const { authorization, user } = await auth.signIn();
    const name = [user?.name?.firstName, user?.name?.lastName].filter(Boolean).join(" ") || undefined;
    return { idToken: authorization.id_token, name };
  } catch (error) {
    const closed = (error as { error?: string })?.error === "popup_closed_by_user";
    throw new ApiError(closed ? "Apple sign-in was closed before it finished." : "Apple sign-in didn't go through. Please try again.", 0);
  }
}
