/* Catalogue Service */
import { ApiError, mockApi } from "@/api/mock";
import { streamingTitlesSeed } from "@/data/streamingTitles";
import { streamingTypesSeed } from "@/data/streamingTypes";
import { streamingCategoriesSeed } from "@/data/streamingCategories";

/**
 * Only what a member may see: published (or scheduled and past its time) with
 * a ready video. The Studio decides the rest; this mirrors its rules.
 */
const visible = (t) =>
  t.video?.status === "ready" &&
  (t.publishStatus === "published" || (t.publishStatus === "scheduled" && new Date(t.releaseAt) <= new Date()));

const catalogue = () => streamingTitlesSeed.filter(visible);

export const listTitles = () => mockApi(catalogue, 200);

export function getTitle(id) {
  return mockApi(() => {
    const t = catalogue().find((x) => x.id === id);
    if (!t) throw new ApiError("That title isn't available.", 404);
    return t;
  }, 150);
}

export function searchTitles(q) {
  const needle = q.trim().toLowerCase();
  return mockApi(() => {
    if (!needle) return [];
    return catalogue().filter((t) =>
      [t.title, t.synopsis, ...(t.cast ?? []).map((c) => c.name), ...(t.crew ?? []).map((c) => c.name)]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, 150);
}

export const listTypes = () => mockApi(() => streamingTypesSeed, 0);
export const listCategories = () => mockApi(() => streamingCategoriesSeed, 0);
