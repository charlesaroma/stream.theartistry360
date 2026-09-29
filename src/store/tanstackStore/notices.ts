/* Cache Notices */

/**
 * Short messages the cache raises for the whole app, e.g. "Couldn't refresh
 * the gallery". A plain external store, read by components/ui/NetworkStatus
 * with useSyncExternalStore, so the query client never imports React UI.
 */

export interface Notice {
  id: number;
  message: string;
}

let notices: Notice[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function notify(message: string, ttl = 6000) {
  // One notice per message: five failed refreshes are one problem, not five.
  if (notices.some((n) => n.message === message)) return;
  const notice = { id: nextId++, message };
  notices = [...notices, notice];
  emit();
  setTimeout(() => dismiss(notice.id), ttl);
}

export function dismiss(id: number) {
  notices = notices.filter((n) => n.id !== id);
  emit();
}

export const noticeStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getSnapshot: () => notices,
};
