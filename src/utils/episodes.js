/* Series Helpers */
// A series is a title with `format: "series"` and `seasons[].episodes[]`.

export const isSeries = (title) => title?.format === "series";

export const flatEpisodes = (title) =>
  (title?.seasons ?? []).flatMap((s) => s.episodes.filter((e) => e.video?.status === "ready").map((e) => ({ ...e, seasonNo: s.number })));

export const findEpisode = (title, id) => flatEpisodes(title).find((e) => e.id === id) ?? null;

export const nextEpisode = (title, id) => {
  const all = flatEpisodes(title);
  const i = all.findIndex((e) => e.id === id);
  return i >= 0 ? all[i + 1] ?? null : null;
};

export const epLabel = (e) => `S${e.seasonNo}:E${e.number}`;

export const seasonCount = (title) => (title?.seasons ?? []).filter((s) => s.episodes.some((e) => e.video?.status === "ready")).length;

/**
 * What the player needs, for a movie or one episode of a series. Keeps the
 * player ignorant of which it is playing.
 */
export function mediaFor(title, episodeId) {
  const ep = isSeries(title) ? (findEpisode(title, episodeId) ?? flatEpisodes(title)[0] ?? null) : null;
  return {
    key: ep ? `${title.id}:${ep.id}` : title.id,
    titleId: title.id,
    episodeId: ep?.id ?? null,
    name: title.title,
    sub: ep ? `${epLabel(ep)} · ${ep.title}` : null,
    playbackUrl: ep?.playbackUrl ?? title.playbackUrl,
    captions: ep?.captions ?? title.captions ?? [],
    duration: ep?.video?.duration ?? title.video?.duration ?? 0,
    intro: ep?.intro ?? null,
    poster: ep?.still || title.backdrop || title.poster,
  };
}
