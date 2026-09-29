/* Reels Page */
import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import ReelViewer from "@/components/player/ReelViewer";
import { useReels } from "@/store/tanstackStore/queries/site";
import { REEL_TABS, isPhone, lastReel } from "@/utils/reels";
import FeaturedReel from "./sections/FeaturedReel";
import ReelsGrid from "./sections/ReelsGrid";
import ReelsToolbar from "./sections/ReelsToolbar";

/**
 * /reels: a feed you drop straight into. A one-line toolbar, the Studio's
 * featured reel playing silently, then the grid. Every card, "Watch from
 * here" and Play Feed open the same full-screen feed.
 *
 * The URL holds the state: ?category, ?tab, and ?reel (the feed is open on
 * that reel). Scrolling the feed keeps ?reel current, so Back from a film
 * returns to the same clip and a copied link opens it. Phones open straight
 * into the feed; its "Browse all" sets ?view=grid.
 */
export default function ReelsPage() {
  const [params, setParams] = useSearchParams();
  const { data: reels = [], isLoading } = useReels();
  const autoOpened = useRef(false);

  const category = params.get("category") ?? "";
  const tab = REEL_TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "trending";
  const reelId = params.get("reel");

  // Featured first (unfiltered view only), then the rest in the tab's order.
  // The feed plays them in exactly this order.
  const { featured, ordered } = useMemo(() => {
    const sorted = reels.filter((r) => !category || r.category === category).sort(REEL_TABS.find((t) => t.id === tab).sort);
    const pick = category ? null : (reels.find((r) => r.featured) ?? sorted[0] ?? null);
    return { featured: pick, ordered: pick ? [pick, ...sorted.filter((r) => r.id !== pick.id)] : sorted };
  }, [reels, category, tab]);

  const update = (changes, { push = false } = {}) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: !push });
  };

  const activeIndex = ordered.findIndex((r) => r.id === reelId);
  const open = (reel) => {
    lastReel.set(reel.id);
    update({ reel: reel.id }, { push: true });
  };
  const onNavigate = (i) => {
    const reel = ordered[i];
    if (!reel || reel.id === reelId) return;
    lastReel.set(reel.id);
    update({ reel: reel.id });
  };

  // Phones: straight into the feed, where they left off, unless they chose the grid.
  useEffect(() => {
    if (autoOpened.current || !ordered.length || reelId || params.get("view") || !isPhone()) return;
    autoOpened.current = true;
    const last = lastReel.get();
    const next = new URLSearchParams(params);
    next.set("reel", ordered.some((r) => r.id === last) ? last : ordered[0].id);
    setParams(next, { replace: true });
  }, [ordered, reelId, params, setParams]);

  return (
    <>
      <ReelsToolbar
        category={category}
        onCategory={(id) => update({ category: id })}
        tab={tab}
        onTab={(id) => update({ tab: id === "trending" ? "" : id })}
        onPlayFeed={() => ordered[0] && open(ordered[0])}
        canPlay={ordered.length > 0}
      />

      {featured && <FeaturedReel reel={featured} upNext={ordered.slice(1, 5)} onOpen={open} />}

      <div className="pb-[clamp(3rem,6vw,6rem)]">
        <ReelsGrid
          reels={featured ? ordered.slice(1) : ordered}
          loading={isLoading}
          onOpen={open}
          onReset={() => update({ category: "", tab: "" })}
        />
      </div>

      <ReelViewer
        open={activeIndex >= 0}
        reels={ordered}
        activeIndex={Math.max(activeIndex, 0)}
        onClose={() => update({ reel: "" })}
        onNavigate={onNavigate}
        onBrowseAll={() => update({ reel: "", view: "grid" })}
      />
    </>
  );
}
