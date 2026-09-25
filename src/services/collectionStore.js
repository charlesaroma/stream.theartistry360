/* Mock Collection Store */

/**
 * A small localStorage-backed table per collection, seeded from src/data.
 * Studio edits survive a reload, so the dashboard behaves like it will once
 * the API is live. Only services touch this; the UI never does.
 */

// Bump the version when seeds change shape, so stale browser copies are dropped.
const PREFIX = "a360:stream:v1:";
const memory = new Map();

function load(key, seed) {
  if (memory.has(key)) return memory.get(key);
  let rows = seed;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw) rows = JSON.parse(raw);
  } catch {
    // Unreadable storage falls back to the seed.
  }
  memory.set(key, rows);
  return rows;
}

function save(key, rows) {
  memory.set(key, rows);
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(rows));
  } catch {
    // Storage full or blocked: the change lasts for this session only.
  }
}

export function createCollection(key, seed, { idPrefix = "id" } = {}) {
  const rows = () => load(key, seed);

  return {
    list: () => [...rows()],
    get: (id) => rows().find((r) => String(r.id) === String(id)) ?? null,
    create: (data) => {
      const row = { ...data, id: data.id || `${idPrefix}_${Date.now().toString(36)}` };
      save(key, [row, ...rows()]);
      return row;
    },
    update: (id, patch) => {
      let updated = null;
      save(key, rows().map((r) => {
        if (String(r.id) !== String(id)) return r;
        updated = { ...r, ...patch, id: r.id };
        return updated;
      }));
      return updated;
    },
    remove: (id) => save(key, rows().filter((r) => String(r.id) !== String(id))),
    reset: () => save(key, seed),
  };
}

/**
 * A single settings document (ads, stream site) instead of a table. `update`
 * merges one level deep, so saving one section never wipes another.
 */
export function createDocument(key, seed) {
  const read = () => load(key, seed);
  return {
    get: () => structuredClone(read()),
    update: (patch) => {
      const current = read();
      const next = { ...current };
      for (const [k, v] of Object.entries(patch)) {
        next[k] = v && typeof v === "object" && !Array.isArray(v) ? { ...current[k], ...v } : v;
      }
      save(key, next);
      return structuredClone(next);
    },
    reset: () => save(key, seed),
  };
}
