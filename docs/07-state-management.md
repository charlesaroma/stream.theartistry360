# 07 — State Management (TanStack Query)

**Rule:** TanStack Query owns everything that comes from the server. Context owns the signed-in member and the playback session. The UI reads and writes data only through `src/store/tanstackStore/queries/`.

Status: **built** (Sept 2026). This is the stream-site version of theartistry360.com's `docs/14-state-management.md`, which explains the reasoning in full. This page records what differs and where each file lives.

## 1. What differs from the main site

- **One realm: `member`.** This is the only place the public signs in (`pages/1.auth`); theartistry360.com has no public login apart from the Google vote prompt. `Realm` is typed as `"member"` alone, so an admin token cannot even be expressed here.
- **A consumer of Studio edits.** Titles, the hero, home rows, plans, ads and WhatsApp links are all written in the Studio and read here, so realtime matters most on this site (section 6).
- **A data router.** `routes/router.jsx` uses `createBrowserRouter`, so route loaders warm the cache (section 5).

## 2. Folder layout

```
src/store/
├── context/
│   ├── MemberContext.jsx            ← session: the signed-in member, sign-in/out, subscribe, purchase
│   ├── PlaybackProvider.jsx         ← UI session state for the player (not server state)
│   └── playbackContext.js
└── tanstackStore/
    ├── queryClient.ts  persist.ts  notices.ts
    ├── services/
    │   ├── api/                     ← transport (TypeScript, member realm only)
    │   ├── types.ts                 ← the contract; the superset of the Studio's types
    │   └── authApi.ts  catalogApi.ts  libraryApi.ts  reelsApi.ts  siteApi.ts
    ├── queries/
    │   ├── keys.ts                  ← siteRoot, memberRoot(id), realmRoot
    │   ├── site/                    ← catalog.ts (titles, search, types, categories), reels.ts, site.ts (stream-site, plans), index.ts
    │   └── member/                  ← library.ts (watchlist, progress, ratings), index.ts
    └── realtime/useLiveInvalidation.ts
```

`hooks/useHls.js` and `hooks/useKeyLight.js` are not data hooks, so they stay in `src/hooks/`. The old `services/collectionStore.js` was never imported here and is gone.

## 3. Keys

| Root | Holds | Persisted |
|---|---|---|
| `["site", …]` | catalogue, search, taxonomy, reels, the stream-site document, plans | yes (`a360s:query-cache`) |
| `["member", memberId, …]` | watchlist, progress, episode progress, ratings, watched reels | never |

- Signed-out visitors use the id `"guest"`.
- **Whenever the account changes** (sign-in, sign-up, sign-out, or a cleared token), `MemberContext` removes every `["member", …]` entry. A guest's list never mixes with an account's, and nothing of one account is left for the next.
- Types and categories use `staleTime: Infinity`, since they change only when the Studio edits them. Not `"static"`: a static query ignores `invalidateQueries`, so live events could never refresh it.

## 4. Mutations

- **Optimistic:** the watchlist toggle and ratings. `onMutate` snapshots and patches, `onError` rolls back, `onSettled` invalidates. They show in several places at once (cards, the title page, My List).
- **Serial:** progress saves share a mutation scope per member, so a late save from the player can never overwrite a newer one. They also refresh the episode progress map through `meta.invalidates`.
- Subscribe and purchase never go optimistic and never queue offline. The UI waits for the API (PesaPal confirms by IPN).

## 5. Loading

- **Route loaders warm the cache** while the page chunk downloads:
  - home: stream-site settings and titles
  - films: titles, types and categories
  - reels: the reels list
  - plans: plans
  - title and watch pages: that title and the list

  Loaders never block and return nothing: pages read the same queries and handle their own loading and 404 states.
- Hovering or focusing a poster prefetches its title (`prefetchTitle`).
- Search passes the `AbortSignal` through, so each keystroke cancels the previous request. It uses `skipToken` until the query has two characters.
- Server errors (5xx) on a first load reach `RouteError.jsx` through `throwOnError`. A 4xx, such as an unknown title, stays in the page.
- `components/ui/NetworkStatus.jsx` shows the offline banner and "couldn't refresh" notices.

## 6. Realtime

`App.jsx` mounts `useLiveInvalidation("public")` and `useLiveInvalidation("member")`. Both are off until `VITE_REALTIME_URL` is set. The public channel carries Studio changes as keys, and this site invalidates them:

| Studio action | Event | Refetches here |
|---|---|---|
| Publish, edit or unpublish a title | `{ entity: ["site","titles"] }` | rows, films, the title page, search |
| Save Stream Site (hero, rows, links) | `{ entity: ["site","stream-site"] }` | home, footer, title-page WhatsApp block |
| Edit types or categories | `["site","types"]`, `["site","categories"]` | filters, chips |
| Publish, edit or feature a reel (Studio › Streaming › Reels) | `["site","reels"]` | the reels page, the home strip, the feed |
| Edit plans or ads | `["site","plans"]`, `["site","ads"]` | plans, the player's pre-roll |

The member channel, authenticated with the member token, carries entitlement changes after a PesaPal IPN (`["member", id, …]`), so Play unlocks without a reload. A channel may only touch its own roots.

**Until the backend exists, a Studio edit does not reach this site**: the Studio and this site each read their own mock copy.

## 7. Persistence and offline

- Only `["site", …]` is persisted, with the build id (`__APP_BUILD__`) as `buster` and a 24 h `maxAge`. Signed-out visitors see home and Films instantly on return, even with a weak connection.
- While offline (`fetchStatus === "paused"`), pages show saved data under the offline banner. The player never claims a stream will play offline.

## 8. Tooling and verification

- TypeScript for the store layer (`tsconfig.json`, `npm run typecheck`).
- ESLint:
  - `typescript-eslint` and `@tanstack/eslint-plugin-query` are on.
  - UI (pages, components, hooks, routes, utils) may not import services, the transport or `src/data`.
- Verified in Chrome:
  - every page (home, films, plans, my-list, search, title, sign-in, sign-up, 404) with no console errors;
  - sign-up, subscribing and the watchlist toggle;
  - the volume readout on the watch page;
  - the reels feed: the scene plays, ±10 s seek, the wheel and ↑/↓ move between reels, a shared `?reel=` link opens that reel (first visit and cached), and "Scene from …" opens the film at the scene (`?t=100`, playing at 104.7 s);
  - only `site` keys persisted, signed out and signed in.
