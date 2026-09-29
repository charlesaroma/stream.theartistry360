/* Query Key Roots */
import type { Id, Realm } from "../services/api/types";

/**
 * Every key starts with its realm (docs/07-state-management.md, section 3).
 *
 *   ["site", …]                 catalogue, taxonomy, stream-site settings, plans; persisted
 *   ["member", memberId, …]     one viewer's watchlist, progress, ratings; never persisted
 *
 * Signed-out visitors use the id "guest", so their list never mixes with an
 * account's.
 */
export const siteRoot = ["site"] as const;
export const memberRoot = (memberId: Id | null | undefined) => ["member", memberId ?? "guest"] as const;

/** The prefix to remove when the realm signs in, out, or loses its token. */
export const realmRoot = (realm: Realm) => [realm] as const;
