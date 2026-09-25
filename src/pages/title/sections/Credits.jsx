/* Credits */
export default function Credits({ cast = [], crew = [] }) {
  if (!cast.length && !crew.length) return null;
  const group = (label, people) =>
    people.length > 0 && (
      <div>
        <h3 className="mb-4 text-caption font-bold uppercase tracking-[0.18em] text-text-muted">{label}</h3>
        <ul className="flex flex-wrap gap-3">
          {people.map((p) => (
            <li key={`${p.name}-${p.role}`} className="flex min-w-44 items-center gap-3 rounded-2xl border border-border-default bg-surface-secondary px-4 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 font-bold text-brand">{p.name.charAt(0)}</span>
              <span>
                <span className="block text-small font-semibold text-text-primary">{p.name}</span>
                <span className="block text-caption text-text-muted">{p.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <section aria-labelledby="credits-heading" className="flex flex-col gap-8">
      <h2 id="credits-heading" className="text-heading">Cast &amp; crew</h2>
      {group("Cast", cast)}
      {group("Crew", crew)}
    </section>
  );
}
