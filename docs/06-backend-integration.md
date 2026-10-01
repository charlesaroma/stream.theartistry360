# 06 — Backend Integration

Same API as theartistry360.com (`api.theartistry360.com/api/v1`), proxied at `/api`. Same envelope `{ data, meta? } | { error }`, same `ApiError`. Swap one service at a time (`src/store/tanstackStore/services/*.ts`), as described in `the_artistry360_2024/docs/12-backend-integration.md`. Query factories and pages do not change. Every call names `realm: "member"`; this site has no other.

**Every endpoint this site uses is listed in `the_artistry360_2024/docs/12-backend-integration.md`, section "the stream site and the mobile app".** That list is shared with the Flutter app, and Joshua builds the API against it. The table below maps this site's services to it; when a path changes, change `12` first.

| Service | Endpoint (see `12` for request and response shapes) |
|---|---|
| `catalogApi.listTitles` / `getTitle` / `searchTitles` | `GET streaming/titles?published=true`, `GET streaming/titles/:id`, `GET streaming/titles?q=` |
| `catalogApi.listTypes` / `listCategories` | `GET streaming/types`, `GET streaming/categories` |
| `siteApi.getSite` / `listPlans` | `GET stream/site`, `GET streaming/plans` |
| `authApi.*` | `POST auth/login`, `POST auth/register`, `GET auth/me`, `POST auth/refresh`, `POST auth/logout` |
| `authApi.signInWithGoogle` | `GET auth/member/google?next=` (redirect flow, PKCE + state; no Google token reaches the page) |
| `authApi.requestPasswordReset` / `resetPassword` | `POST auth/password/forgot`, `POST auth/password/reset` |
| `authApi.subscribe` / `purchase` | `POST payments/orders` → PesaPal; granted only by `POST payments/pesapal/ipn` |
| `libraryApi.*` | `GET library`, `PUT/DELETE library/watchlist/:titleId`, `PUT/DELETE library/ratings/:titleId`, `PUT library/progress`, `DELETE library/progress[/:titleId]` |
| `commentsApi.*` | `GET/POST streaming/titles/:id/comments`, `POST …/:cid/like`, `POST …/:cid/report`, `DELETE …/:cid`, `GET library/comment-likes` |
| player | `POST streaming/playback` → a signed, expiring HLS URL; `403 locked` if not entitled |

Share cards: once the API is live, set `SHARE_API_BASE` in Netlify so link previews read `streaming/titles/:id` from it (`08-sharing-and-seo.md`).

Remove `playbackUrl` from the seed once `streaming/playback` exists. The demo stream is Mux's public test HLS.

## Security already in place

- Links from the Studio (WhatsApp channel and group, announcement) are shown only if they are `https://` or a page on this site (`utils/links.js`, `safeHref`). Anything else renders as "Soon" or nothing.
- `?next=` after sign-in, sign-up and payment only goes to a page on this site (`safeNext`): no open redirects.
- `public/_headers`: no framing, nosniff, strict referrer, sensors and payment off, HSTS, COOP that allows sign-in popups. A full Content-Security-Policy lands with the backend.

## Account (`services/accountApi.ts`)

Paths as in `12` (Account and Payments). The app uses the same ones.

| Service | Endpoint (member realm; the member comes from the session only) |
|---|---|
| `listPayments` | `GET payments/history` (every source: PesaPal, App Store, Google Play) |
| `updateProfile` | `PATCH auth/me` |
| `requestEmailChange` | `POST auth/me/email`, then `POST auth/me/email/verify` with the 6-digit code |
| `changePassword` | `POST auth/me/password` `{ current?, next }` (revokes other sessions) |
| `setCancelAtPeriodEnd` | `POST payments/subscription/cancel` or `/resume` (website plans; store plans are managed in the store) |
| sign out everywhere | `POST auth/sessions/revoke-all` |
| `clearHistory` | `DELETE library/progress` |
| `deleteAccount` | `POST auth/me/delete` `{ password?, confirm: "DELETE" }` |
| (on request by email) | a copy of the member's data, as the Data Protection and Privacy Act requires |
