/* Title Grid */
import PosterCard from "./PosterCard";

export default function TitleGrid({ titles, empty }) {
  if (!titles.length) return <div className="shell py-16 text-center text-body text-text-muted">{empty}</div>;
  return (
    <ul className="shell grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-5 2xl:grid-cols-6">
      {titles.map((t) => (
        <li key={t.id}><PosterCard title={t} /></li>
      ))}
    </ul>
  );
}
