/* Announcement Bar */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";

import { useSite } from "@/hooks/useCatalog";

const DISMISS_KEY = "a360s:announcement";

/** One line above the nav, written in the Studio (Streaming › Stream Site). */
export default function AnnouncementBar() {
  const { data: site } = useSite();
  const a = site?.announcement;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === a?.text;
    } catch {
      return false;
    }
  });
  if (!a?.enabled || !a.text || dismissed) return null;

  const internal = a.linkUrl?.startsWith("/");
  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, a.text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative z-50 bg-brand text-black">
      <div className="shell flex min-h-10 items-center justify-center gap-3 py-1.5 pr-12 text-small font-semibold">
        <span className="text-center">{a.text}</span>
        {a.linkLabel && a.linkUrl && (internal ? (
          <Link to={a.linkUrl} viewTransition className="inline-flex shrink-0 items-center gap-1 underline underline-offset-4">{a.linkLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
        ) : (
          <a href={a.linkUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 underline underline-offset-4">{a.linkLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></a>
        ))}
      </div>
      <button type="button" onClick={dismiss} aria-label="Dismiss announcement" className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full hover:bg-black/10">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
