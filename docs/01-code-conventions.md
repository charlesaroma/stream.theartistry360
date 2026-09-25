# 01 — Code Conventions

This site follows the conventions of `the_artistry360_2024/docs/01-code-conventions.md` (file naming, `sections/`, the `@/` alias, forms, comments, colour tokens). Differences:

- **Router:** `createBrowserRouter` in `src/routes/router.jsx`, with lazy routes from `src/routes/pages.js`. Links use `viewTransition` so the iris runs.
- **Layout:** `SiteLayout` pulls `<main>` up under the transparent navbar (`-mt-18`). Pages start with either a full-bleed stage (home, title) or `PageIntro`, which clears the navbar with the same spacing everywhere.
- **Buttons:** `components/ui/Button` (variants `primary`, `light`, `glass`; `to` routes with the iris) and `IconButton` (round glass). Both carry the ember press.
- **Positioning:** `molten-glass` sets no position. Add `relative` or `absolute` yourself; `.ember` lives in the components layer so `absolute` still wins.
- **Type:** only the scale tokens in `index.css`. Long film titles step down from `text-display` to `text-title` (more than 24 characters).
