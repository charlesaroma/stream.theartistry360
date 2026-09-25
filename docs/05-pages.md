# 05 — Pages

| Folder | Route | What |
|---|---|---|
| `1.home` | `/` | Hero (Studio featured order), rows (Studio row settings), then for signed-out visitors: plans, why, FAQ. Community card for everyone |
| `2.films` | `/films` | Full catalogue; type, category and access chips; sort; filters in the URL (`?type=&category=&access=&sort=`) |
| `3.plans` | `/plans` | Plan cards (Studio › Subscriptions) → PesaPal stand-in; `?next=` returns to the title |
| `4.my-list` | `/my-list` | Continue watching and saved titles (per member, local until the API) |
| `title/` | `/title/:id` | Stage, access-aware main action (Play / Sign up free / Subscribe / Buy UGX), list, share, story, cast & crew, **WhatsApp Channel + Group**, more like this |
| `watch/` | `/watch/:id` | Full-screen HLS player, free-tier pre-roll, resume, shortcuts (Space/K, J/L, M, F) |
| `search/` | `/search?q=` | Titles, cast and crew |
| `auth/` | `/sign-in`, `/sign-up` | Glass card over a cinema still; `?next=` redirect |

## UI/UX audit (25 Sept 2026)

Measured in headless Chrome at 1440px and 390px:

- **Type:** only scale sizes render. Nothing is below 12px on any page.
- **Gutter:** every section heading starts on the gutter (56px desktop, 16px phone).
- **Rhythm:** home rows are 411px tall with an exact 64px gap. This fixed an earlier 48px drift caused by glass arrow buttons falling back into the flow.
- **Targets:** all controls are at least 44px tall.
- **Layout:** no horizontal scroll at 390px. No console errors.
