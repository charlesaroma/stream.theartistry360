# 05 — Pages

| Folder | Route | What |
|---|---|---|
| `1.auth` | `/sign-in`, `/sign-up` | Glass card over a cinema still; `?next=` redirect |
| `2.home` | `/` | Hero (Studio featured order), rows (Studio row settings), reels strip, then for signed-out visitors: plans, why, FAQ. Community card for everyone |
| `3.films` | `/films` | One-line header (Films, search, sort), one filter row: type tabs, Genre and Access menus (bottom sheets on phones), removable chips with Clear all. No filters: the tab's featured film and rows; a filter or search: a sorted grid. `?tab=&genre=&access=&q=&sort=` |
| `4.reels` | `/reels`, `?reel=<id>`, `?view=grid` | One-line header (Reels, category chips with dots, Trending / New / Most liked, Play Feed), the Studio's featured reel playing silently with Up next, then the grid. Phones open straight into the feed; its Browse all shows the grid |
| `5.plans` | `/plans` | Plan cards (Studio › Subscriptions) → PesaPal stand-in; `?next=` returns to the title |
| `6.my-list` | `/my-list` | Continue watching and saved titles (per member, local until the API) |
| `7.search` | `/search?q=` | Titles, cast and crew |
| `8.title` | `/title/:id` | Stage, access-aware main action (Play / Sign up free / Subscribe / Buy UGX), list, share, story, cast & crew, **WhatsApp Channel + Group**, more like this |
| `9.watch` | `/watch/:id`, `?ep=`, `?t=<seconds>` | Full-screen HLS player, free-tier pre-roll, resume, shortcuts (Space/K, J/L, ←/→, ↑/↓ volume, M, F, C, P). A volume readout shows on the picture while the level changes. `?t=` starts at that second (a reel's "Scene from …") instead of where the member stopped |

Folders follow the nav (Home, Films, Reels, Plans, My List), with `1.auth` first and the pages outside the nav after.

## Browse pages (Films, Reels)

- **Header:** `components/layout/BrowseHeader` is the shared one-line header: page name, the page's controls and its actions, straight under the navbar. Main-menu pages have no Back button.
- **Films cards** (`PosterCard`):
  - The title is on the 2:3 poster, with year · type · length below (series show an episode count).
  - The orange line shows how far you got.
  - The hover preview plays the trailer.
- **Access label** (`AccessLabel`):
  - A solid dark label with an icon, bottom-left, worded for the viewer.
  - Signed out: Free, Subscribers or the UGX price.
  - Subscribers: "Included", and nothing on free titles. "Owned" once bought.
- **Films genres** come from the chosen tab's own titles, so they always make sense for it.
- **Reel cards** (`ReelCard`):
  - The title, creator, views and length sit on a dark fade, with a category dot.
  - An orange line appears once watched.
  - Hovering plays the scene silently, but only with a mouse, no reduced motion, no data saver and a 4G connection. The play icon sits in the logo's orbit.

## The reels feed (`components/player/ReelViewer.jsx`, `ReelSlide.jsx`, `ReelRail.jsx`, `ReelInfo.jsx`)

- **One action everywhere.** A card, "Watch from here" and Play Feed all open this feed. `?reel=` keeps its place, so Back from a film returns to the same clip and a copied link opens it.
- **Scroll to move.** One reel per screen in a scroll-snap column: the mouse wheel, a trackpad, touch swipes, ↑/↓ and Page Up/Down all work, momentum included, as do the arrows beside the reel.
- **One stream at a time.** Only the reel mostly in view (60%) mounts a `<video>`. The others show their poster and are `inert`. The featured reel's silent preview stops while the feed is open.
- **Sound:**
  - On once the visitor has touched the page; opening a reel is that tap.
  - A feed opened cold (a shared link) starts muted, and the first tap inside turns sound on unless they chose mute.
  - If a browser refuses sound, the reel plays muted.
- **Controls:**
  - Play/pause, ±10 s seek (Space/K, ←/J, →/L) and mute (M) at the top left, with the scene's time and a scrubber along the top edge.
  - Seeking stays inside the scene, which loops. There is no reel counter.
  - The logo's orbit turns while buffering.
- **Rail:** the creator, like, share (copies `/reels?reel=<id>`), and My List for the film.
- **"From <film> · Watch the film"** opens the film at the scene when the member can watch it, and otherwise its page (sign in, subscribe or buy).
- A reel counts as watched after 5 s (or half a short one).
- Esc or a click beside the reel closes the feed. On phones, a grid button beside Close goes to Browse all.

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
