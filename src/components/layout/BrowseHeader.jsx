/* Browse Header */
import { cn } from "@/utils/cn";

/**
 * The one-line header for browse pages (Films): the page name on the
 * left, the page's own controls in the middle, actions on the right. It sits
 * straight under the navbar and wraps on narrow screens, so content starts in
 * the first screen. Main-menu pages have no Back button.
 */
export default function BrowseHeader({ title, children, actions, className }) {
  return (
    <header className={cn("shell flex flex-wrap items-center gap-x-6 gap-y-3 pb-5 pt-[calc(4.5rem+clamp(1.25rem,3vw,2rem))]", className)}>
      <h1 className="text-heading">{title}</h1>
      {children}
      {actions && <div className="ml-auto flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
