/* Series Helpers */
// A series is a title with `format: "series"` and `seasons[].episodes[]`.

export const isSeries = (title) => title?.format === "series";

/** Out now: the video is ready and any scheduled release time has passed. */
export const isReleased = (e) => e.video?.status === "ready" && (!e.releaseAt || new Date(e.releaseAt) <= new Date());

/** Every playable episode in order, each tagged with its season number. */
export const flatEpisodes = (title) =>
  (title?.seasons ?? []).flatMap((s) => s.episodes.filter(isReleased).map((e) => ({ ...e, seasonNo: s.number })));

/**
 * Seasons for the episode list: every episode that is out or announced
 * (ready or scheduled), in number order. Drafts without video stay hidden.
 */
export const listedSeasons = (title) =>
  (title?.seasons ?? [])
    .map((s) => ({ ...s, episodes: [...s.episodes].filter((e) => e.video?.status === "ready").sort((a, b) => a.number - b.number).map((e) => ({ ...e, seasonNo: s.number })) }))
    .filter((s) => s.episodes.length)
    .sort((a, b) => a.number - b.number);

/**
 * Where "Play" should go: the episode last watched (or the next one if it was
 * finished), else the first. `progress` and `episodes` are the member's maps.
 */
export function resumeEpisode(title, progress = {}, episodes = {}) {
  const all = flatEpisodes(title);
  if (!all.length) return null;
  const lastId = progress[title.id]?.episodeId ?? Object.entries(episodes).filter(([id]) => all.some((e) => e.id === id)).sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt))[0]?.[0];
  const last = all.find((e) => e.id === lastId);
  if (!last) return { episode: all[0], resume: false };
  if (episodes[last.id]?.done) {
    const next = nextEpisode(title, last.id);
    return next ? { episode: next, resume: false } : { episode: all[0], resume: false };
  }
  return { episode: last, resume: true };
}

export const findEpisode = (title, id) => flatEpisodes(title).find((e) => e.id === id) ?? null;

export const nextEpisode = (title, id) => {
  const all = flatEpisodes(title);
  const i = all.findIndex((e) => e.id === id);
  return i >= 0 ? all[i + 1] ?? null : null;
};

export const epLabel = (e) => `S${e.seasonNo}:E${e.number}`;

export const seasonCount = (title) => listedSeasons(title).length;

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
