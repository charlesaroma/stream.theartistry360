/* Legal */
import { Link, Navigate, useParams } from "react-router-dom";
import { FileWarning, Mail, Printer } from "lucide-react";

import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/utils/cn";
import { COMPANY, LEGAL_DRAFT } from "./content/company";
import { LEGAL_DOCS, legalDoc } from "./content";
import Blocks from "./sections/Blocks";

/**
 * /legal/:doc: Terms, Privacy, Refunds, Community Guidelines, Cookies &
 * Ads, Copyright. A short "in brief" first, a contents list that stays in
 * view on desktop, then the full text. Content lives in ./content.
 */
export default function LegalPage() {
  const { doc: slug } = useParams();
  const doc = legalDoc(slug);
  usePageMeta({ title: doc?.title, description: doc?.summary[0] });
  if (!doc) return <Navigate to="/legal/terms" replace />;

  return (
    <div className="shell pb-[clamp(3rem,6vw,6rem)] pt-[calc(4.5rem+2rem)]">
      <header className="mb-10 max-w-3xl">
        <p className="eyebrow mb-2">Legal</p>
        <h1 className="text-title">{doc.title}</h1>
        <p className="mt-3 text-small text-text-muted">Last updated {doc.updated} · {COMPANY.name}</p>
        {LEGAL_DRAFT && (
          <p className="mt-5 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-small text-warning">
            <FileWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Draft for The Artistry360's review with a lawyer before launch. Not yet in force.
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Legal documents" className="mb-8">
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {LEGAL_DOCS.map((d) => (
                <li key={d.slug}>
                  <Link
                    to={`/legal/${d.slug}`}
                    aria-current={d.slug === doc.slug ? "page" : undefined}
                    className={cn("inline-flex min-h-10 items-center rounded-full px-4 text-small font-semibold transition-colors lg:w-full lg:rounded-xl", d.slug === doc.slug ? "bg-brand/15 text-brand" : "text-text-secondary hover:bg-white/6 hover:text-text-primary")}
                  >
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="On this page" className="hidden lg:block">
            <p className="mb-2 text-caption font-bold uppercase tracking-[0.15em] text-text-muted">On this page</p>
            <ol className="flex flex-col gap-1 border-l border-white/10">
              {doc.sections.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1 pl-4 text-small text-text-secondary hover:border-brand hover:text-text-primary">{s.title}</a></li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="flex max-w-3xl flex-col gap-10">
          <section aria-labelledby="in-brief" className="rounded-3xl border border-brand/25 bg-brand/5 p-6">
            <h2 id="in-brief" className="mb-3 text-subheading font-bold">In brief</h2>
            <Blocks blocks={[{ list: doc.summary }]} />
          </section>

          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28">
              <h2 id={`${s.id}-h`} className="mb-4 text-heading">{i + 1}. {s.title}</h2>
              <div className="flex flex-col gap-4"><Blocks blocks={s.blocks} /></div>
            </section>
          ))}

          <footer className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/8 bg-surface-card/60 p-6 text-small text-text-secondary">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand" aria-hidden="true" /> Questions? <a href={`mailto:${COMPANY.email}`} className="font-semibold text-brand hover:underline">{COMPANY.email}</a> · {COMPANY.phone}</p>
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 font-semibold hover:border-white/30"><Printer className="h-4 w-4" aria-hidden="true" /> Print</button>
          </footer>
        </article>
      </div>
    </div>
  );
}
