# 05 — Pages

| Folder | Route | What |
|---|---|---|
| `1.auth` | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password?token=` | Glass card over a cinema still; **Continue with Google** first, then email and password; "Forgot password?" under the password; `?next=` redirect (site paths only) |
| `2.home` | `/` | Hero (Studio featured order), rows (Studio row settings), then for signed-out visitors: plans, why, FAQ. Community card for everyone |
| `3.films` | `/films` | One-line header (Films, search, sort), one filter row: type tabs, Genre and Access menus (bottom sheets on phones), removable chips with Clear all. No filters: the tab's featured film and rows; a filter or search: a sorted grid. `?tab=&genre=&access=&q=&sort=` |
| `4.plans` | `/plans` | Plan cards (Studio › Subscriptions) → PesaPal stand-in; `?next=` returns to the title |
| `5.my-list` | `/my-list` | Continue watching and saved titles (per member, local until the API) |
| `6.search` | `/search?q=` | Titles, cast and crew |
| `7.title` | `/title/:id`, `?play=1` | Stage, **Play** (the price gate opens only when pressed), list, share, story, cast & crew, **WhatsApp Channel + Group**, more like this. `?play=1` opens the gate on arrival |
| `8.watch` | `/watch/:id`, `?ep=`, `?t=<seconds>` | Full-screen HLS player, free-tier pre-roll, resume, shortcuts (Space/K, J/L, ←/→, ↑/↓ volume, M, F, C, P). A volume readout shows on the picture while the level changes. `?t=` starts at that second (a shared timestamp). Someone who can't watch yet is sent to `/title/:id?play=1` |

Folders follow the nav (Home, Films, Plans, My List), with `1.auth` first and the pages outside the nav after.

**Films only** (client, 30 Sept 2026): no reels or monologues on this site. Monologues live on talent pages at theartistry360.com.

## Browse pages (Films)

- **Header:** `components/layout/BrowseHeader` is the shared one-line header: page name, the page's controls and its actions, straight under the navbar. Main-menu pages have no Back button.
- **Cards** (`PosterCard`, client's reference: clean artwork, details below):
  - Nothing written over the poster except a **save** button (top left; signed-out viewers go to sign in) and the **year** (bottom right); the Most Watched row adds a small #rank.
  - Below the poster: the title (one line), then the genre and the age rating.
  - **No price or access label anywhere on browse pages.** Price shows only in the play gate.
  - The orange line shows how far you got; the hover preview plays the trailer.
- **Play gate** (`pages/7.title/sections/PlayGate.jsx`): every Play goes to `/watch/:id`; without access the viewer lands on the title page with the gate open. Pay-per-view opens the PesaPal checkout; subscription titles show the cheapest plan's price and "See plans"; signed-out viewers get Sign in / Create a free account, returning to the film.
- **Films genres** come from the chosen tab's own titles, so they always make sense for it.

## The film player on phones (`components/player/Player.jsx`, `Controls.jsx`)

- **Controls fit the player's own width** (a container query), so a phone, a small window and the mini player all get one clean row. On a narrow player, subtitles (also in Settings) and picture-in-picture step aside, and every button stays at least 44 px.
- **The time sits beside the seek bar**, so it never wraps.
- **The timeline:**
  - On touch screens the seek handle is always visible and the bar is 36 px tall to hit.
  - A tap shows the controls, and a second tap while playing hides them.
  - They stay up 4.5 s, and touching or dragging them keeps them up.
  - Only a mouse leaving hides them.
- **The centre play button** sits above the controls' fade, which never takes taps itself. It ignores the click from the tap that revealed it, so revealing the controls never pauses the film.

## UI/UX audit (25 Sept 2026)

Measured in headless Chrome at 1440px and 390px:

- **Type:** only scale sizes render. Nothing is below 12px on any page.
- **Gutter:** every section heading starts on the gutter (56px desktop, 16px phone).
- **Rhythm:** home rows are 411px tall with an exact 64px gap. This fixed an earlier 48px drift caused by glass arrow buttons falling back into the flow.
- **Targets:** all controls are at least 44px tall.
- **Layout:** no horizontal scroll at 390px. No console errors.
