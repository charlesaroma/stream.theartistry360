/* Catalogue Service */
import { http } from "@/store/tanstackStore/services/api/client";
import { useMockApi } from "@/store/tanstackStore/services/api/config";
import { routes } from "@/store/tanstackStore/services/api/routes";
import { ApiError, mockApi } from "@/store/tanstackStore/services/api/mock";
import type { Id, RequestOptions } from "@/store/tanstackStore/services/api/types";
import type { Category, Title, VideoType } from "./types";
import { streamingTitlesSeed } from "@/data/streamingTitles";
import { streamingTypesSeed } from "@/data/streamingTypes";
import { streamingCategoriesSeed } from "@/data/streamingCategories";

/**
 * Only what a member may see: published (or scheduled and past its time) with
 * a ready video. Live, the API applies those rules (GET streaming/titles) and
 * never sends a playback link: the player asks for one (startPlayback). The
 * mock mirrors the rules on the demo catalogue.
 */
const visible = (t: Title) =>
  t.video?.status === "ready" &&
  (t.publishStatus === "published" || (t.publishStatus === "scheduled" && t.releaseAt !== null && new Date(t.releaseAt) <= new Date()));

const catalogue = () => (streamingTitlesSeed as unknown as Title[]).filter(visible);

export const listTitles = ({ signal }: RequestOptions = {}) =>
  !useMockApi ? http.get<Title[]>(routes.titles, { params: { published: true }, signal }) : mockApi(catalogue, 200, signal);

export function getTitle(id: Id, { signal }: RequestOptions = {}) {
  if (!useMockApi) return http.get<Title>(`${routes.titles}/${encodeURIComponent(id)}`, { signal });
  return mockApi(() => {
    const t = catalogue().find((x) => x.id === id);
    if (!t) throw new ApiError("That title isn't available.", 404);
    return t;
  }, 150, signal);
}

export function searchTitles(q: string, { signal }: RequestOptions = {}) {
  const needle = q.trim().toLowerCase();
  if (!useMockApi) return needle ? http.get<Title[]>(routes.titles, { params: { q: needle }, signal }) : Promise.resolve([]);
  return mockApi(() => {
    if (!needle) return [];
    return catalogue().filter((t) =>
      [t.title, t.synopsis, ...(t.cast ?? []).map((c) => c.name), ...(t.crew ?? []).map((c) => c.name)]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, 150, signal);
}

export const listTypes = ({ signal }: RequestOptions = {}) =>
  !useMockApi ? http.get<VideoType[]>(routes.types, { signal }) : mockApi(() => streamingTypesSeed as VideoType[], 0, signal);
export const listCategories = ({ signal }: RequestOptions = {}) =>
  !useMockApi ? http.get<Category[]>(routes.categories, { signal }) : mockApi(() => streamingCategoriesSeed as Category[], 0, signal);

export interface Playback {
  url: string;
  expiresAt: string;
  duration: number;
}

/**
 * A link to play a film or one episode, for this viewer only and for a few
 * hours: `POST streaming/playback`. The API checks they may watch it
 * (`403 locked` otherwise). The mock plays the title's demo stream.
 */
export function startPlayback({ titleId, episodeId = null, fallbackUrl }: { titleId: Id; episodeId?: Id | null; fallbackUrl?: string }, { signal }: RequestOptions = {}) {
  if (!useMockApi) return http.post<Playback>(routes.playback, { titleId, episodeId }, { signal });
  return mockApi(() => ({ url: fallbackUrl ?? "", expiresAt: new Date(Date.now() + 6 * 3600_000).toISOString(), duration: 0 }), 0, signal);
}
