/* Home */
import CommunityCard from "@/components/title/CommunityCard";
import Hero from "@/components/title/Hero";
import PosterCard from "@/components/title/PosterCard";
import ReelsSection from "@/components/title/ReelsSection";
import Row from "@/components/title/Row";
import { useMember } from "@/store/context/MemberContext";
import { useSite, useTitles } from "@/store/tanstackStore/queries/site";
import { useProgress } from "@/store/tanstackStore/queries/member";
import { resolveRow, seeAllFor } from "@/utils/rows";
import Faq from "./sections/Faq";
import PlansBand from "./sections/PlansBand";
import WhyStrip from "./sections/WhyStrip";
import { usePageMeta } from "@/hooks/usePageMeta";

/**
 * Hero and rows come from the Studio (Streaming › Stream Site). Visitors who
 * are not signed in also get plans, why, community and FAQ below the rows.
 */
export default function HomePage() {
  usePageMeta();
  const { member } = useMember();
  const { data: site } = useSite();
  const { data: titles = [] } = useTitles();
  const { progress } = useProgress();

  const featured = (site?.hero.featuredIds ?? []).map((id) => titles.find((t) => t.id === id)).filter(Boolean);
  const rows = (site?.rows ?? []).filter((r) => r.enabled);
  const hasReelsRow = rows.some((r) => r.source === "reels" || r.id === "reels");

  return (
    <>
      <Hero titles={featured} />

      {/* Rows rise over the hero's fade, as one continuous stage */}
      <div className="relative z-10 -mt-[clamp(2rem,6vw,5rem)] flex flex-col gap-[clamp(2.5rem,5vw,4rem)] pb-[clamp(3rem,6vw,6rem)]">
        {rows.map((r) => {
          if (r.source === "reels" || r.id === "reels") {
            return <ReelsSection key={r.id} title={r.label} />;
          }
          return (
            <Row
              key={r.id}
              title={r.label}
              seeAll={seeAllFor(r.source)}
              items={resolveRow(r.source, { titles, progress })}
              render={(t, i) => <PosterCard title={t} rank={r.source === "trending" && i < 10 ? i + 1 : undefined} />}
            />
          );
        })}
        {!hasReelsRow && <ReelsSection />}
      </div>

      {!member && (
        <>
          <PlansBand />
          <WhyStrip />
        </>
      )}
      <div className="shell pb-[clamp(3rem,6vw,6rem)]">
        <CommunityCard />
      </div>
      {!member && <Faq />}
    </>
  );
}
