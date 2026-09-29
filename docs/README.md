# Artistry360 Stream — Build Breakdown & Status Tracker

**stream.theartistry360.com**: where members watch The Artistry360's films, shorts and replays. It is **strictly streaming**: no class timetable, no academy pages, no voting. Those live on theartistry360.com. The **Studio** (in the `the_artistry360_2024` repo, Streaming group) controls everything shown here.

Vite 8 · React 19 · React Router 7 (data router) · TanStack Query (TypeScript store layer) · Tailwind 4 · react-hook-form + zod · Lucide · Motion · hls.js. It still runs on mock data in `src/data/`, reached only through `src/store/tanstackStore/services/`.

## Golden Rules

1. **Strictly streaming.** No timetables, classes pages or academy features. Recorded classes are ordinary titles (type *Class Replay*).
2. **The Studio decides.** What is published, the hero, the home rows, plans, ads and the WhatsApp links all come from Studio settings (`03-data-contract.md`). Nothing is hard-coded here that the Studio can change.
3. **Backend-ready.** UI → query hook → service → api, all under `src/store/` (`07-state-management.md`); ESLint blocks services, the transport and `@/data/*` in UI.
4. **Numbering starts at 1, and every page folder is numbered.** Auth is always `1.auth`, then the nav (`2.home`, `3.films`, `4.plans`, `5.my-list`), then pages outside the nav (`6.search`, `7.title`, `8.watch`, `9.account`). `not-found.jsx` is a loose file, not a folder.
5. **One type scale, one gutter.** Use `text-display` / `title` / `heading` / `subheading` / `lead` / `body` / `small` / `caption` only, and `shell`, `section-y` and `PageIntro`. Nothing below 12px, and targets are at least 44px.
6. **Light & Lens motion** (`04-motion.md`): glass, ember press, iris, key light. Every effect has a still state under reduced motion.
7. **Logo.** Orbit A, the same logo as theartistry360.com. Use `<BrandLogo />` (`src/components/ui/brand/`; the navbar uses `intro` for the animated entrance). Files are in `public/brand/`, web icons in `public/`, guide in `docs/brand/README.md`.
8. **Code splitting.** Every page is a lazy route; hls.js loads only when someone presses play.

## Phases

| # | Phase | Doc | Status |
|---|---|---|---|
| 0 | Config & dependencies | `02-dependencies.md` | done |
| 1 | Data contract & services | `03-data-contract.md` | done (mock) |
| 2 | Design system & motion | `04-motion.md` | done |
| 3 | Pages: home, films, plans, my list, title, watch, search, auth (Google, forgot/reset password) | `05-pages.md` | done (mock) |
| 3b | Browse pages rebuilt: shared header, one filter row, rows then grid, clean poster cards (details below, no price), play gate, phone player controls | `05-pages.md` | done |
| 3c | Share cards per film, page titles, sitemap | `08-sharing-and-seo.md` | done (verify cards after the first deploy) |
| 4 | UI/UX audit (type scale, gutter, targets) | `05-pages.md` | done |
| 5 | Backend integration | `06-backend-integration.md` | pending |
| 5a | State layer: `src/store/`, TanStack query factories, TypeScript, realtime | `07-state-management.md` | done (realtime waits on the backend socket) |

## Docs

| Doc | Covers |
|---|---|
| `01-code-conventions.md` | Same as theartistry360.com, plus what differs here |
| `02-dependencies.md` | Packages and why |
| `03-data-contract.md` | The shapes the Studio writes and this site reads |
| `04-motion.md` | The Light & Lens motion language |
| `brand/README.md` | The Orbit A logo (shared with theartistry360.com): variations, colours, clear space, animation, web icons. Files are in `public/brand/` |
| `05-pages.md` | Every page, what it shows, audit results |
| `06-backend-integration.md` | Moving from mocks to the API |
| `07-state-management.md` | The store: keys, caching, mutations, loaders, and how Studio edits reach this site live |
| `08-sharing-and-seo.md` | Link previews per film (edge function), page titles, sitemap |
| `09-legal.md` | Legal pages (Terms, Privacy, Refunds, Community, Cookies & Ads, Copyright) and what to confirm before launch |
| Mobile app and API | The Flutter app and the shared Node server are designed in `the_artistry360_2024/docs/16-mobile-app.md` and `17-api-server.md` |

## Verifier

```bash
npm run typecheck && npm run lint && npx vite build
npm run dev   # http://localhost:5174
```
