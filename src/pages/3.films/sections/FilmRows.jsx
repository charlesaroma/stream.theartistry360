/* Film Rows */
import PosterCard from "@/components/title/PosterCard";
import Row from "@/components/title/Row";
import { useProgress } from "@/store/tanstackStore/queries/member";
import { continueItems } from "@/utils/rows";

const byNewest = (a, b) => new Date(b.releaseAt) - new Date(a.releaseAt);

/**
 * Browsing without filters: rows like the home page, for the chosen tab.
 * Continue watching, New releases, Free to watch, Behind the Scenes (on All), then one
 * row per genre. "See all" switches to the grid with that filter.
 */
export default function FilmRows({ tab, titles, genres }) {
  const { progress } = useProgress();
  // A /films link that keeps the current tab and adds one filter.
  const link = (extra) => `/films?${new URLSearchParams({ ...(tab.id ? { tab: tab.id } : {}), ...extra })}`;

  const rows = [
    { id: "continue", title: "Continue watching", items: continueItems(titles, progress).map((c) => c.title), seeAll: "/my-list" },
    { id: "new", title: "New releases", items: [...titles].sort(byNewest).slice(0, 12) },
    { id: "free", title: "Free to watch", items: titles.filter((t) => t.access?.tier === "free"), seeAll: link({ access: "free" }) },
    // Behind the Scenes has its own tab, so it only appears as a row on All.
    !tab.id && { id: "bts", title: "Behind the Scenes", items: titles.filter((t) => t.type === "bts"), seeAll: "/films?tab=bts" },
    ...genres.map((g) => ({ id: g.id, title: g.name, items: titles.filter((t) => t.categoryIds?.includes(g.id)), seeAll: link({ genre: g.id }) })),
  // Drop the false entry from the tab check and any row with nothing in it.
  ].filter((r) => r && r.items.length > 0);

  return (
    <div className="flex flex-col gap-[clamp(2.5rem,5vw,4rem)]">
      {rows.map((r) => (
        <Row key={r.id} title={r.title} seeAll={r.seeAll} items={r.items} render={(t) => <PosterCard title={t} />} />
      ))}
    </div>
  );
}
