/* Page Meta Hook */
import { useEffect } from "react";

const SITE = "Artistry360 Stream";

/**
 * The tab title and description for the page in view, for people and for
 * Google (which runs the app). Link previews on WhatsApp, Facebook and the
 * like do not run it; they get their card from the share-card edge function.
 */
export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
    const meta = document.querySelector('meta[name="description"]');
    const previous = meta?.getAttribute("content");
    if (meta && description) meta.setAttribute("content", description);
    return () => {
      if (meta && previous) meta.setAttribute("content", previous);
    };
  }, [title, description]);
}
