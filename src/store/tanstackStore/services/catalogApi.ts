/* Catalogue Service */
import { ApiError, mockApi } from "@/store/tanstackStore/services/api/mock";
import type { Id, RequestOptions } from "@/store/tanstackStore/services/api/types";
import type { Category, Title, VideoType } from "./types";
import { streamingTitlesSeed } from "@/data/streamingTitles";
import { streamingTypesSeed } from "@/data/streamingTypes";
import { streamingCategoriesSeed } from "@/data/streamingCategories";

/**
 * Only what a member may see: published (or scheduled and past its time) with
 * a ready video. The Studio decides the rest; this mirrors its rules.
 */
const visible = (t: Title) =>
  t.video?.status === "ready" &&
  (t.publishStatus === "published" || (t.publishStatus === "scheduled" && t.releaseAt !== null && new Date(t.releaseAt) <= new Date()));

const catalogue = () => (streamingTitlesSeed as unknown as Title[]).filter(visible);

export const listTitles = ({ signal }: RequestOptions = {}) => mockApi(catalogue, 200, signal);

export function getTitle(id: Id, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    const t = catalogue().find((x) => x.id === id);
    if (!t) throw new ApiError("That title isn't available.", 404);
    return t;
  }, 150, signal);
}

export function searchTitles(q: string, { signal }: RequestOptions = {}) {
  const needle = q.trim().toLowerCase();
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

export const listTypes = ({ signal }: RequestOptions = {}) => mockApi(() => streamingTypesSeed as VideoType[], 0, signal);
export const listCategories = ({ signal }: RequestOptions = {}) =>
  mockApi(() => streamingCategoriesSeed as Category[], 0, signal);
