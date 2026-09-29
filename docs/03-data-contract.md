# 03 — Data Contract (Studio → Stream)

> The same shapes as TypeScript: `src/store/tanstackStore/services/types.ts` (keep it in step with theartistry360.com's). How they are cached and refreshed live when the Studio changes them: `07-state-management.md`.

The Studio (repo `the_artistry360_2024`, sidebar group **Streaming**) writes. This site reads. Until the API exists, both run on mocks with the **same shapes**. The seeds in `src/data/` mirror the Studio's, so edits in the Studio are not visible here yet; when the API lands, both call the same endpoints.

| This site reads | Studio page | Seed here | API (planned) |
|---|---|---|---|
| Titles (published + video ready) | Streaming › Library | `data/streamingTitles.js` | `GET streaming/titles?published=true` |
| Video types, categories | Streaming › Types & Categories | `data/streamingTypes.js`, `streamingCategories.js` | `GET streaming/types`, `GET streaming/categories` |
| Plans | Streaming › Subscriptions | `data/streamingPlans.js` | `GET streaming/plans` |
| Hero, home rows, WhatsApp links, announcement | Streaming › Stream Site | `data/streamSite.js` | `GET stream/site` |
| Ad tag (free tier) | Streaming › Ads | (player stand-in) | `GET streaming/ads/public` |

## Visibility rule

A title shows only when `video.status === "ready"` and it is `published`, or `scheduled` with `releaseAt` in the past (`store/tanstackStore/services/catalogApi.ts`). The Studio enforces the same rule.

## Access rule (`utils/access.js`, MOU 3D)

| Tier | Who can watch |
|---|---|
| `free` | Any signed-in member, with ads |
| `subscription` | Members with an active plan |
| `ppv` | Members who bought the title (PesaPal) |

The API enforces this again by handing out **signed, expiring HLS URLs** per play. The browser check is only for the UI.

## Home rows

`rows[].source` decides what each row lists (`utils/rows.js`):

- `trending`: top 10 by views, ranked
- `continue`: this member's progress
- `new`: by release date
- `tier:free`, `type:<id>`, `category:<id>`

## WhatsApp community

`community.channelUrl` and `community.groupUrl` feed the card on every film page and the footer icon. A missing link renders as a "Soon" button rather than disappearing.
