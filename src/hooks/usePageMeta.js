/* Page Meta Hook */
import { useEffect } from "react";

import { DEFAULT_DESCRIPTION, pageTitle } from "@/seo/seo";

function setMeta(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!content) return el?.remove();
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * The tab title, description and robots rule for the page in view, for
 * people and for Google (which runs the app). Titles and descriptions come
 * from src/seo/seo.js, as the share-card edge function's do; link previews
 * get their card from that function, since they never run the app.
 * `noindex` for private pages (My List, account, sign-in, search, watch).
 */
export function usePageMeta({ title, description, noindex = false } = {}) {
  useEffect(() => {
    document.title = pageTitle(title);
    setMeta("description", description || DEFAULT_DESCRIPTION);
    setMeta("robots", noindex ? "noindex" : null);
  }, [title, description, noindex]);
}
