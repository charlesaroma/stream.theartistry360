/* Reels Service */
import { ApiError, mockApi } from "@/store/tanstackStore/services/api/mock";
import type { Id, RequestOptions } from "@/store/tanstackStore/services/api/types";
import type { Reel } from "./types";
import { streamingReelsSeed } from "@/data/streamingReels";

const reels = () => streamingReelsSeed as unknown as Reel[];

export const listReels = ({ signal }: RequestOptions = {}) => mockApi(reels, 150, signal);

export function getReel(id: Id, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    const r = reels().find((x) => x.id === id);
    if (!r) throw new ApiError("That reel isn't available.", 404);
    return r;
  }, 100, signal);
}
