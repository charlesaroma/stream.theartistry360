/* Network Status */
import { useSyncExternalStore } from "react";
import { onlineManager } from "@tanstack/react-query";
import { WifiOff, X } from "lucide-react";

import { dismiss, noticeStore } from "@/store/tanstackStore/notices";

const subscribeOnline = (fn) => onlineManager.subscribe(fn);
const isOnline = () => onlineManager.isOnline();

/**
 * One live region for the whole app: an offline banner while queries are
 * paused, and the cache's "couldn't refresh" notices. Mounted once in
 * AppProviders, above every route.
 */
export default function NetworkStatus() {
  const online = useSyncExternalStore(subscribeOnline, isOnline, () => true);
  const notices = useSyncExternalStore(noticeStore.subscribe, noticeStore.getSnapshot, noticeStore.getSnapshot);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[10000] flex flex-col items-center gap-2 px-4"
    >
      {!online && (
        <p className="pointer-events-auto flex min-h-11 items-center gap-2 rounded-full border border-warning/40 bg-surface-card px-4 text-sm text-text-primary shadow-lg">
          <WifiOff className="h-4 w-4 text-warning" aria-hidden="true" />
          You&apos;re offline. Showing saved data; it will refresh when you reconnect.
        </p>
      )}
      {notices.map((n) => (
        <p
          key={n.id}
          className="pointer-events-auto flex min-h-11 items-center gap-2 rounded-full border border-border-default bg-surface-card py-1 pl-4 pr-1 text-sm text-text-secondary shadow-lg"
        >
          {n.message}
          <button
            type="button"
            onClick={() => dismiss(n.id)}
            aria-label="Dismiss"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </p>
      ))}
    </div>
  );
}
