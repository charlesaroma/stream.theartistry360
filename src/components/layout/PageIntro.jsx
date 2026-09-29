/* Page Intro */
import BackButton from "@/components/ui/BackButton";

/**
 * Every inner page opens the same way: clears the navbar, then eyebrow, title
 * and one line of lead, on the shared gutter. Keeps page tops aligned.
 */
export default function PageIntro({ eyebrow, title, lead, children, back = true }) {
  return (
    <header className="shell pb-[clamp(2rem,4vw,3rem)] pt-[calc(4.5rem+clamp(2.5rem,6vw,5rem))]">
      {back && <BackButton className="mb-8" />}
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="text-title text-balance">{title}</h1>
      {lead && <p className="mt-4 max-w-2xl text-lead text-text-secondary">{lead}</p>}
      {children}
    </header>
  );
}
