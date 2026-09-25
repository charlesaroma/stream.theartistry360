/* My List */
import PageIntro from "@/components/layout/PageIntro";
import TitleGrid from "@/components/title/TitleGrid";
import { useTitles } from "@/hooks/useCatalog";
import { useProgress, useWatchlist } from "@/hooks/useLibrary";

export default function MyListPage() {
  const { data: titles = [] } = useTitles();
  const { list } = useWatchlist();
  const { progress } = useProgress();
  const saved = list.map((id) => titles.find((t) => t.id === id)).filter(Boolean);
  const continuing = Object.keys(progress).map((id) => titles.find((t) => t.id === id)).filter(Boolean);

  return (
    <>
      <PageIntro eyebrow="Library" title="My List" lead="What you saved for later, and what you're halfway through." />
      <div className="flex flex-col gap-[clamp(2.5rem,5vw,4rem)] pb-[clamp(3rem,6vw,6rem)]">
        {continuing.length > 0 && (
          <section aria-labelledby="continue">
            <h2 id="continue" className="shell text-heading mb-5">Continue watching</h2>
            <TitleGrid titles={continuing} />
          </section>
        )}
        <section aria-labelledby="saved">
          <h2 id="saved" className="shell text-heading mb-5">Saved</h2>
          <TitleGrid titles={saved} empty="Tap + on any title to save it here." />
        </section>
      </div>
    </>
  );
}
