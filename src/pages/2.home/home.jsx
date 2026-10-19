/* Home */
import CommunityCard from "@/components/title/CommunityCard";
import Hero from "@/components/title/Hero";
import PosterCard from "@/components/title/PosterCard";
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

  // Keep the Studio's order and drop any featured id that is no longer published.
  const featured = (site?.hero.featuredIds ?? []).map((id) => titles.find((t) => t.id === id)).filter(Boolean);
  // Rows switched off in the Studio stay saved but hidden.
  const rows = (site?.rows ?? []).filter((r) => r.enabled);

  return (
    <>
      {/* Hero: the Studio's featured titles, with an empty list while the site loads. */}
      <Hero titles={featured} />

      {/* Rows rise over the hero's fade, as one continuous stage */}
      <div className="relative z-10 -mt-[clamp(2rem,6vw,5rem)] flex flex-col gap-[clamp(2.5rem,5vw,4rem)] pb-[clamp(3rem,6vw,6rem)]">
        {rows.map((r) => {
          return (
            <Row
              key={r.id}
              title={r.label}
              seeAll={seeAllFor(r.source)}
              items={resolveRow(r.source, { titles, progress })}
              // Only the trending row shows a rank, for its top ten.
              render={(t, i) => <PosterCard title={t} rank={r.source === "trending" && i < 10 ? i + 1 : undefined} />}
            />
          );
        })}
      </div>

      {/* Signed-out visitors also see the pitch: plans and why to join. */}
      {!member && (
        <>
          <PlansBand />
          <WhyStrip />
        </>
      )}
      {/* Community Card: shown to everyone. */}
      <div className="shell pb-[clamp(3rem,6vw,6rem)]">
        <CommunityCard />
      </div>
      {/* Members already know the answers, so the FAQ is for visitors only. */}
      {!member && <Faq />}
    </>
  );
}
