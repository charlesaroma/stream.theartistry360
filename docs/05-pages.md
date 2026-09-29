# 05 — Pages

| Folder | Route | What |
|---|---|---|
| `1.auth` | `/sign-in`, `/sign-up` | Glass card over a cinema still; `?next=` redirect |
| `2.home` | `/` | Hero (Studio featured order), rows (Studio row settings), reels strip, then for signed-out visitors: plans, why, FAQ. Community card for everyone |
| `3.films` | `/films` | Full catalogue; type, category and access chips; sort; filters in the URL (`?type=&category=&access=&sort=`) |
| `4.reels` | `/reels`, `/reels?reel=<id>` | 9:16 scenes, monologues, auditions and behind-the-scenes; category chips and sort. **The feed** (below) opens from a card, "Play Feed", or a shared `?reel=` link |
| `5.plans` | `/plans` | Plan cards (Studio › Subscriptions) → PesaPal stand-in; `?next=` returns to the title |
| `6.my-list` | `/my-list` | Continue watching and saved titles (per member, local until the API) |
| `7.search` | `/search?q=` | Titles, cast and crew |
| `8.title` | `/title/:id` | Stage, access-aware main action (Play / Sign up free / Subscribe / Buy UGX), list, share, story, cast & crew, **WhatsApp Channel + Group**, more like this |
| `9.watch` | `/watch/:id`, `?ep=`, `?t=<seconds>` | Full-screen HLS player, free-tier pre-roll, resume, shortcuts (Space/K, J/L, ←/→, ↑/↓ volume, M, F, C, P). A volume readout shows on the picture while the level changes. `?t=` starts at that second (a reel's "Scene from …") instead of where the member stopped |

Folders follow the nav (Home, Films, Reels, Plans, My List), with `1.auth` first and the pages outside the nav after.

## The reels feed (`components/player/ReelViewer.jsx`, `ReelSlide.jsx`)

- **Scroll to move.** One reel per screen in a scroll-snap column, so the mouse wheel, a trackpad, touch swipes, ↑/↓ and Page Up/Down all work, momentum included. The arrow buttons beside the reel still work too.
- **One stream at a time.** Only the reel mostly in view (60%) mounts a `<video>` and plays. The others show their poster and are `inert`, so neither focus nor clicks reach them.
- **Controls.** Play/pause and ±10 s seek at the top left (Space/K, ←/J, →/L), with the scene's elapsed and total time, and a scrubber along the top edge. Seeking stays inside the scene, and the reel loops its scene.
- **Rail:** like, sound (M; muted to start, shared across reels), share (copies `/reels?reel=<id>`), and the title page.
- **"Scene from "<title>" · m:ss"** opens the full title at the scene if the member can watch it, and otherwise its title page (sign in, subscribe or buy).
- Esc or a click beside the reel closes the feed.

## UI/UX audit (25 Sept 2026)

Measured in headless Chrome at 1440px and 390px:

- **Type:** only scale sizes render. Nothing is below 12px on any page.
- **Gutter:** every section heading starts on the gutter (56px desktop, 16px phone).
- **Rhythm:** home rows are 411px tall with an exact 64px gap. This fixed an earlier 48px drift caused by glass arrow buttons falling back into the flow.
- **Targets:** all controls are at least 44px tall.
- **Layout:** no horizontal scroll at 390px. No console errors.
