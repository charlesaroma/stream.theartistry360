# 06 — Backend Integration

Same API as theartistry360.com (`api.theartistry360.com/api/v1`), proxied at `/api`. Same envelope `{ data, meta? } | { error }`, same `ApiError`. Swap one service at a time (`src/store/tanstackStore/services/*.ts`), as described in `the_artistry360_2024/docs/12-backend-integration.md`. Query factories and pages do not change. Every call names `realm: "member"`; this site has no other.

| Service | Endpoint |
|---|---|
| `catalogApi.listTitles` / `getTitle` / `searchTitles` | `GET streaming/titles?published=true`, `GET streaming/titles/:id`, `GET streaming/titles?q=` |
| `catalogApi.listTypes` / `listCategories` | `GET streaming/types`, `GET streaming/categories` |
| `siteApi.getSite` / `listPlans` | `GET stream/site`, `GET streaming/plans` |
| `authApi.*` | `POST auth/login`, `POST auth/register`, `GET auth/me` (same member accounts as the main site; phone OTP per MOU 3D) |
| `authApi.signInWithGoogle` | Browser goes to `GET auth/member/google?next=`; the API runs the OAuth code flow (PKCE + state), links or creates the member, sets the refresh cookie and redirects to `next` (site paths only). No Google token reaches the page |
| `authApi.requestPasswordReset` / `resetPassword` | `POST auth/password/forgot` (same answer whether or not the email exists; rate-limited per email and IP), `POST auth/password/reset` (single-use token, 30 min; signs out other sessions) |
| `authApi.subscribe` / `purchase` | `POST payments/orders` → PesaPal redirect; granted only by `POST payments/pesapal/ipn` |
| `libraryApi.*` | `GET/POST me/watchlist`, `GET/PUT me/progress/:titleId` |
| player | `GET streaming/titles/:id/play` → signed, expiring HLS URL; `403` if not entitled |

Share cards: once the API is live, set `SHARE_API_BASE` in Netlify so link previews read `streaming/titles/:id` from it (`08-sharing-and-seo.md`).

Remove `playbackUrl` from the seed once `/play` exists. The demo stream is Mux's public test HLS.

## Security already in place

- Links from the Studio (WhatsApp channel and group, announcement) are shown only if they are `https://` or a page on this site (`utils/links.js`, `safeHref`). Anything else renders as "Soon" or nothing.
- `?next=` after sign-in, sign-up and payment only goes to a page on this site (`safeNext`): no open redirects.
- `public/_headers`: no framing, nosniff, strict referrer, sensors and payment off, HSTS, COOP that allows sign-in popups. A full Content-Security-Policy lands with the backend.

## Account (`services/accountApi.ts`)

| Service | Endpoint (member realm; member from the session only) |
|---|---|
| `listPayments` | `GET payments?mine` (rows written only by the PesaPal IPN webhook) |
| `updateProfile` | `PATCH auth/me` (name, phone) |
| `requestEmailChange` | `POST auth/me/email` (sends a confirmation link; the email changes when it is opened) |
| `changePassword` | `POST auth/me/password` (current password unless Google-only; revokes other sessions) |
| `setCancelAtPeriodEnd` | `PATCH payments/subscription` (cancel or keep; access to `renewsAt`) |
| sign out everywhere | `POST auth/sessions/revoke-all` |
| `getSettings` / `updateNotifications` / `updateParental` | `GET/PATCH account/settings` (PIN hashed server-side with a slow hash; PIN required to change controls) |
| `exportData` | `GET account/export` (everything held about the member) |
| `clearHistory` | `DELETE library/progress` |
| `deleteAccount` | `DELETE auth/me` (erases personal data; payment records kept only as the law requires, without personal details) |

