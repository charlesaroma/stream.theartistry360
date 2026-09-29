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
  subscription: { planId: Id; status: "active" | "past_due" | "cancelled"; renewsAt: string } | null;
  purchases: Id[];
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

export type ReelCategory = "monologue" | "highlight" | "bts" | "audition" | "teaser";

export interface Reel {
  id: Id;
  title: string;
  category: ReelCategory;
  caption: string;
  /** Seconds; clip.end - clip.start. */
  duration: number;
  /** The linked title's HLS stream; the reel plays the clip window of it. */
  playbackUrl: string;
  /** The scene, in seconds into the title, so "Scene from …" opens the title there. */
  clip: { start: number; end: number };
  poster: string;
  views: number;
  likes: number;
  /** ISO date; orders the New tab. */
  publishedAt: string;
  /** The Studio's featured pick, shown large at the top of /reels. */
  featured?: boolean;
  talent?: {
    name: string;
    role: string;
    avatar?: string;
  };
  titleId?: Id;
  /** Display fallback only; the viewer names the title from the catalogue. */
  titleName?: string;
}

