/* Legal Documents */
import community from "./community";
import cookies from "./cookies";
import copyright from "./copyright";
import privacy from "./privacy";
import refunds from "./refunds";
import terms from "./terms";

/** In footer order. The slug is the URL: /legal/<slug>. */
export const LEGAL_DOCS = [terms, privacy, refunds, community, cookies, copyright];
export const legalDoc = (slug) => LEGAL_DOCS.find((d) => d.slug === slug) ?? null;
