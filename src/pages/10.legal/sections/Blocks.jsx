/* Legal Blocks */
// A section's content: paragraphs (strings), { list: [...] } or
// { table: { head, rows } }. Plain text only, so nothing can inject markup.
export default function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    if (typeof b === "string") return <p key={i} className="text-body leading-relaxed text-text-secondary">{b}</p>;
    if (b.list) {
      return (
        <ul key={i} className="flex list-disc flex-col gap-2 pl-5 text-body leading-relaxed text-text-secondary marker:text-brand">
          {b.list.map((item) => <li key={item}>{item}</li>)}
        </ul>
      );
    }
    if (b.table) {
      return (
        <div key={i} className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full min-w-120 text-left text-small">
            <thead className="bg-white/4">
              <tr>{b.table.head.map((h) => <th key={h} className="px-4 py-3 font-semibold text-text-primary">{h}</th>)}</tr>
            </thead>
            <tbody>
              {b.table.rows.map((row) => (
                <tr key={row[0]} className="border-t border-white/8 align-top">
                  {row.map((cell, c) => <td key={c} className={c === 0 ? "px-4 py-3 font-semibold text-text-primary" : "px-4 py-3 text-text-secondary"}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  });
}
