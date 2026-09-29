# 05 — Pages

| Folder | Route | What |
|---|---|---|
| `1.auth` | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password?token=` | Glass card over a cinema still; **Continue with Google** first, then email and password; "Forgot password?" under the password; `?next=` redirect (site paths only) |
| `2.home` | `/` | Hero (Studio featured order; swaps as a focus pull with the copy wiping in; one glass pill holds the picker and the trailer's sound button, which must stay while trailers play with sound by default, WCAG 1.4.2), rows (Studio row settings), then for signed-out visitors: plans, why, FAQ. Community card for everyone |
| `3.films` | `/films` | One-line header (Films, search, sort), one filter row: type tabs, Genre and Access menus (bottom sheets on phones), removable chips with Clear all. No filters: the tab's featured film and rows; a filter or search: a sorted grid. `?tab=&genre=&access=&q=&sort=` |
| `4.plans` | `/plans` | Plan cards (Studio › Subscriptions) → PesaPal stand-in; `?next=` returns to the title |
| `5.my-list` | `/my-list` | Continue watching and saved titles (per member, local until the API) |
| `6.search` | `/search?q=` | Titles, cast and crew |
| `7.title` | `/title/:id`, `?play=1` | Stage, **Play** (the price gate opens only when pressed), list, share, story, cast & crew, **WhatsApp Channel + Group**, more like this. `?play=1` opens the gate on arrival |
| `8.watch` | `/watch/:id`, `?ep=`, `?t=<seconds>` | Full-screen HLS player, free-tier pre-roll, resume, shortcuts (Space/K, J/L, ←/→, ↑/↓ volume, M, F, C, P). A volume readout shows on the picture while the level changes. `?t=` starts at that second (a shared timestamp). Someone who can't watch yet is sent to `/title/:id?play=1`  Desktop: player in a main column with a toolbar under it (Expand/theatre, Auto next, Auto skip intro, Lights, Prev/Next episode, My List; choices kept in this browser, `hooks/useWatchPrefs.js`) and a sidebar: episode number grid for series, More like this, community. Phones stack it. |
| `9.account` | `/account?tab=` | Members only (signed out: sign in and back). The standard streaming set: **Membership** (plan, renewal, change, cancel at period end, keep; films bought; PesaPal payment history with receipts), **Security** (name, phone, email change by confirmation link, password or set one for Google accounts, sign out of all devices, delete account by typing DELETE), **Playback** (auto next, auto skip intro, subtitles on, data saver 480p; this device), **Viewing activity** (titles started, newest first; remove one or clear all). Old `?tab=subscription/purchases/profile/privacy` links still work. Linked from the account menu and the mobile menu |

Folders follow the nav (Home, Films, Plans, My List), with `1.auth` first and the pages outside the nav after.

**Films and series only** (client, 30 Sept 2026). Monologues live on talent pages at theartistry360.com.

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

## Parental guidance, comments, community

- **Age rating** (`utils/ageRatings.js`, `AgeBadge`): G, PG, 13+, 16+, 18+ as colour-coded badges on cards and the meta line, with the meaning on hover and for screen readers. The title page's **Parental guidance** block gives the meaning and the content warnings (`advisories`, set in the Studio). When a film starts, "Rated 16+ · Violence, language and alcohol" shows in the corner for 7 s (`RatingNotice`).
- **Comments** (`components/title/Comments.jsx`, `services/commentsApi.ts`): on the title and watch pages. Anyone reads; members post (500 characters, optional spoiler cover), like, delete their own and report. Top / Newest. Bodies render as plain text. The API must take the author from the session, strip control characters, rate-limit, and queue reports for moderation in the Studio. The mock keeps comments in the browser, seeded from `data/comments.js`.
- **WhatsApp community card**: live with sample Channel and Group links from the Stream Site settings; set the real ones in Studio › Streaming › Stream Site.

