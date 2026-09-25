# 02 — Dependencies

| Package | Why |
|---|---|
| `react`, `react-dom` ^19.2 | UI |
| `react-router-dom` ^7.18 | Data router: lazy routes, `viewTransition` |
| `@tanstack/react-query` ^5 | Server state |
| `react-hook-form`, `@hookform/resolvers`, `zod` | Sign-in and sign-up forms |
| `tailwindcss`, `@tailwindcss/vite` ^4.3 | Styling (CSS-first config in `index.css`) |
| `clsx`, `tailwind-merge` | `cn()` |
| `lucide-react` | Icons; brand marks come from `components/ui/BrandIcons` (Simple Icons, CC0) |
| `motion` | `MotionConfig reducedMotion="user"` |
| `hls.js` | Adaptive HLS playback outside Safari; loaded on demand by the player |

Dev: Vite 8, `@vitejs/plugin-react` 6, ESLint 10 with the layering rules, `@tanstack/react-query-devtools`.

Still to add, with the backend: the Google IMA SDK for real pre-roll ads (the tag is set in Studio › Streaming › Ads).
