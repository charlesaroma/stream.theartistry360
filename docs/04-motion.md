# 04 — Motion: "Light & Lens"

A cinematic motion language, deliberately different from belioras's squash-and-stretch and plain frost. Everything is shared with theartistry360.com except the iris, which needs a data router.

| Effect | Where | How |
|---|---|---|
| **Molten glass** | Navbar controls, buttons (`variant="glass"`), hero rail, modals, community card, auth card | `molten-glass` utility: frosted body, a pointer-tracked specular (`--mx/--my` from `MotionRoot` on any `[data-glass]`), and a warm caustic that circles the rim (`@property --caustic`) |
| **Ember press** | Every `Button`, `IconButton`, filter chip, anything with `.ember` | `MotionRoot` sinks the control 1px and spills a molten drop from the exact contact point; two droplets split off through the SVG goo filter `#ember-goo`. Keyboard presses bloom from the centre |
| **Iris** | Every route change through `Link viewTransition` | View Transitions API; the new page opens as a circle from the last press point (`--iris-x/--iris-y`) while the old one dims |
| **Key light** | Poster cards | `useKeyLight`: up to 7° tilt toward the pointer and a soft light that follows it, via CSS variables only (no re-renders) |
| **Hover-intent preview** | Poster cards (mouse only) | After 480 ms a richer card opens in a portal (rows can't clip it), with play, add to list, info, progress and access; it closes on scroll |
| **Stage** | Hero, title page, auth | Slow Ken Burns push, film grain, crossfading featured titles, and a glass progress rail that doubles as the picker |

**Reduced motion:** grain, Ken Burns, tilt, iris, ember and hero rotation all stop, and every element keeps a finished, still state.
