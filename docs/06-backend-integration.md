# 06 — Backend Integration

Same API as theartistry360.com (`api.theartistry360.com/api/v1`), proxied at `/api`. Same envelope `{ data, meta? } | { error }`, same `ApiError`. Swap one service at a time (`src/store/tanstackStore/services/*.ts`), as described in `the_artistry360_2024/docs/12-backend-integration.md`. Query factories and pages do not change. Every call names `realm: "member"`; this site has no other.

| Service | Endpoint |
|---|---|
| `catalogApi.listTitles` / `getTitle` / `searchTitles` | `GET streaming/titles?published=true`, `GET streaming/titles/:id`, `GET streaming/titles?q=` |
| `catalogApi.listTypes` / `listCategories` | `GET streaming/types`, `GET streaming/categories` |
| `siteApi.getSite` / `listPlans` | `GET stream/site`, `GET streaming/plans` |
| `authApi.*` | `POST auth/login`, `POST auth/register`, `GET auth/me` (same member accounts as the main site; phone OTP and Google sign-in per MOU 3D) |
| `authApi.subscribe` / `purchase` | `POST payments/orders` → PesaPal redirect; granted only by `POST payments/pesapal/ipn` |
| `libraryApi.*` | `GET/POST me/watchlist`, `GET/PUT me/progress/:titleId` |
| player | `GET streaming/titles/:id/play` → signed, expiring HLS URL; `403` if not entitled |

Remove `playbackUrl` from the seed once `/play` exists. The demo stream is Mux's public test HLS.
