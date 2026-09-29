/* Domain Types */

/**
 * What the Studio publishes and this site reads. The same resources as
 * theartistry360.com's store/tanstackStore/services/types.ts; this side is the
 * superset, because the stream site already reads fields the Studio cannot
 * edit yet (series seasons, trailers, captions, public ratings). Keep the two
 * files in step; docs/03-data-contract.md is the prose version.
 */
import type { Id } from "./api/types";

export type VideoStatus = "none" | "uploading" | "processing" | "ready" | "failed";
export type AccessTier = "free" | "subscription" | "ppv";
export type PublishStatus = "draft" | "scheduled" | "published" | "unpublished";
export type Rating = "meh" | "like" | "love";

export interface Credit {
  name: string;
  role: string;
}

export interface Caption {
  lang: string;
  label: string;
  src: string;
}

export interface Episode {
  id: Id;
  number: number;
  title: string;
  synopsis: string;
  still: string;
  video: { status: VideoStatus; duration?: number };
  playbackUrl: string;
  /** Where the intro runs, for "Skip intro". */
  intro?: { start: number; end: number };
  releaseAt?: string;
}

export interface Season {
  number: number;
  title: string;
  episodes: Episode[];
}

export interface Title {
  id: Id;
  title: string;
  /** A VideoType id. */
  type: string;
  format?: "series";
  synopsis: string;
  description: string;
  categoryIds: Id[];
  language: string;
  ageRating: string;
  /** Content warnings shown with the rating (Violence, Language…). */
  advisories?: string[];
  releaseYear: number;
  cast: Credit[];
  crew: Credit[];
  poster: string;
  backdrop: string;
  trailerUrl: string;
  trailer?: { status: VideoStatus; playbackUrl: string; autoplay?: boolean };
  video: { status: VideoStatus; duration?: number };
  playbackUrl?: string;
  captions?: Caption[];
  seasons?: Season[];
  access: { tier: AccessTier; priceUGX: number };
  publishStatus: PublishStatus;
  releaseAt: string | null;
  featured?: boolean;
  views: number;
  ratings?: Record<Rating, number>;
}

export interface VideoType {
  id: Id;
  name: string;
  slug: string;
}

export type Category = VideoType;

export interface Plan {
  id: Id;
  name: string;
  priceUGX: number;
  interval: "month" | "quarter" | "year";
  benefits: string[];
  active: boolean;
  highlight: boolean;
}

export interface HomeRow {
  id: string;
  label: string;
  /** `trending`, `continue`, `new`, `tier:<tier>`, `type:<id>` or `category:<id>`. */
  source: string;
  enabled: boolean;
}

export interface StreamSite {
  community: { enabled: boolean; heading: string; body: string; channelUrl: string; groupUrl: string };
  hero: { featuredIds: Id[]; autoplayTrailers?: boolean };
  rows: HomeRow[];
  announcement: { enabled: boolean; text: string; linkLabel: string; linkUrl: string };
}

export interface Member {
  id: Id;
  name: string;
  email: string;
  phone?: string;
  /** How they sign in: a password, or Google only (no password set). */
  provider?: "email" | "google";
  /** A new email waiting for its confirmation link. */
  pendingEmail?: string | null;
  subscription: {
    planId: Id;
    status: "active" | "past_due" | "cancelled";
    renewsAt: string;
    /** Cancelled, but paid up: access continues until renewsAt. */
    cancelAtPeriodEnd?: boolean;
  } | null;
  purchases: Id[];
}

export interface Payment {
  id: Id;
  kind: "subscription" | "purchase";
  planId?: Id;
  titleId?: Id;
  description: string;
  amountUGX: number;
  method: string;
  /** PesaPal's reference, for support queries. */
  reference: string;
  status: "paid" | "refunded" | "failed";
  paidAt: string;
}

export interface MemberSettings {
  /** Email only. */
  notifications: { newReleases: boolean; newEpisodes: boolean; payments: boolean };
}

/** Where a member stopped a title (the latest episode for a series). */
export interface ProgressEntry {
  seconds: number;
  duration: number;
  updatedAt: string;
  episodeId?: Id;
}

export interface EpisodeProgress {
  seconds: number;
  duration: number;
  done: boolean;
  updatedAt: string;
}


