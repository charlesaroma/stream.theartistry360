/* Home */
import CommunityCard from "@/components/title/CommunityCard";
import Hero from "@/components/title/Hero";
import PosterCard from "@/components/title/PosterCard";
import Row from "@/components/title/Row";
import { useMember } from "@/context/MemberContext";
import { useSite, useTitles } from "@/hooks/useCatalog";
import { useProgress } from "@/hooks/useLibrary";
import { resolveRow, seeAllFor } from "@/utils/rows";
import Faq from "./sections/Faq";
import PlansBand from "./sections/PlansBand";
import WhyStrip from "./sections/WhyStrip";

/**
 * Hero and rows come from the Studio (Streaming › Stream Site). Visitors who
 * are not signed in also get plans, why, community and FAQ below the rows.
 */
export default function HomePage() {
  const { member } = useMember();
  const { data: site } = useSite();
  const { data: titles = [] } = useTitles();
  const { progress } = useProgress();

  const featured = (site?.hero.featuredIds ?? []).map((id) => titles.find((t) => t.id === id)).filter(Boolean);
  const rows = (site?.rows ?? []).filter((r) => r.enabled);

  return (
    <>
      <Hero titles={featured} />

      {/* Rows rise over the hero's fade, as one continuous stage */}
      <div className="relative z-10 -mt-[clamp(2rem,6vw,5rem)] flex flex-col gap-[clamp(2.5rem,5vw,4rem)] pb-[clamp(3rem,6vw,6rem)]">
        {rows.map((r) => (
          <Row
            key={r.id}
            title={r.label}
            seeAll={seeAllFor(r.source)}
            items={resolveRow(r.source, { titles, progress })}
            render={(t, i) => <PosterCard title={t} rank={r.source === "trending" && i < 10 ? i + 1 : undefined} />}
          />
        ))}
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
