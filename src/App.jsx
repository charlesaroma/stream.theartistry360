/* Root Application */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { RouterProvider } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { MemberProvider } from "@/context/MemberContext";
import { router } from "@/routes/router";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <MemberProvider>
          <RouterProvider router={router} hydrateFallbackElement={<PageLoader />} />
        </MemberProvider>
      </MotionConfig>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
