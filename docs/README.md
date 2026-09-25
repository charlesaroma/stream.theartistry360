# Artistry360 Stream — Build Breakdown & Status Tracker

**stream.theartistry360.com**: where members watch The Artistry360's films, shorts and replays. It is **strictly streaming**: no class timetable, no academy pages, no voting. Those live on theartistry360.com. The **Studio** (in the `the_artistry360_2024` repo, Streaming group) controls everything shown here.

Vite 8 · React 19 · React Router 7 (data router) · React Query · Tailwind 4 · react-hook-form + zod · Lucide · Motion · hls.js. It still runs on mock data in `src/data/`, reached only through `src/services/`.

## Golden Rules

1. **Strictly streaming.** No timetables, classes pages or academy features. Recorded classes are ordinary titles (type *Class Replay*).
2. **The Studio decides.** What is published, the hero, the home rows, plans, ads and the WhatsApp links all come from Studio settings (`03-data-contract.md`). Nothing is hard-coded here that the Studio can change.
3. **Backend-ready.** UI → hook → service → api; ESLint blocks `@/api/*` and `@/data/*` in UI.
4. **Numbering starts at 1.** `pages/1.home`, `2.films`, `3.plans`, `4.my-list`; pages outside the nav are unnumbered (`title/`, `watch/`, `search/`, `auth/`).
5. **One type scale, one gutter.** Use `text-display` / `title` / `heading` / `subheading` / `lead` / `body` / `small` / `caption` only, and `shell`, `section-y` and `PageIntro`. Nothing below 12px, and targets are at least 44px.
6. **Light & Lens motion** (`04-motion.md`): glass, ember press, iris, key light. Every effect has a still state under reduced motion.
7. **Code splitting.** Every page is a lazy route; hls.js loads only when someone presses play.

## Phases

| # | Phase | Doc | Status |
|---|---|---|---|
| 0 | Config & dependencies | `02-dependencies.md` | done |
| 1 | Data contract & services | `03-data-contract.md` | done (mock) |
| 2 | Design system & motion | `04-motion.md` | done |
| 3 | Pages: home, films, plans, my list, title, watch, search, auth | `05-pages.md` | done (mock) |
| 4 | UI/UX audit (type scale, gutter, targets) | `05-pages.md` | done |
| 5 | Backend integration | `06-backend-integration.md` | pending |

## Docs

| Doc | Covers |
|---|---|
| `01-code-conventions.md` | Same as theartistry360.com, plus what differs here |
| `02-dependencies.md` | Packages and why |
| `03-data-contract.md` | The shapes the Studio writes and this site reads |
| `04-motion.md` | The Light & Lens motion language |
| `05-pages.md` | Every page, what it shows, audit results |
| `06-backend-integration.md` | Moving from mocks to the API |

## Verifier

```bash
npm run lint && npx vite build
npm run dev   # http://localhost:5174
```
