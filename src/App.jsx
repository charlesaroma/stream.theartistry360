/* Root Application */
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { RouterProvider } from "react-router-dom";

import NetworkStatus from "@/components/ui/NetworkStatus";
import PageLoader from "@/components/ui/PageLoader";
import { MemberProvider } from "@/store/context/MemberContext";
import PlaybackProvider from "@/store/context/PlaybackProvider";
import { router } from "@/routes/router";
import { persistOptions } from "@/store/tanstackStore/persist";
import { queryClient } from "@/store/tanstackStore/queryClient";
import { useLiveInvalidation } from "@/store/tanstackStore/realtime/useLiveInvalidation";

/**
 * Studio edits (public channel) and this member's own changes (member
 * channel) arrive as invalidations; off until VITE_REALTIME_URL is set.
 */
function LiveUpdates() {
  useLiveInvalidation("public");
  useLiveInvalidation("member");
  return null;
}

export default function App() {
  return (
    // The catalogue and Studio settings (["site", …]) are restored from storage; see persist.ts
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <MotionConfig reducedMotion="user">
        <MemberProvider>
          <PlaybackProvider>
            <RouterProvider router={router} hydrateFallbackElement={<PageLoader />} />
          </PlaybackProvider>
        </MemberProvider>
      </MotionConfig>
      <LiveUpdates />
      <NetworkStatus />
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
