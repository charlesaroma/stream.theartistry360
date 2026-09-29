/* Site Shell */
import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PlayerHost from "@/components/player/PlayerHost";
import MotionRoot from "@/components/motion/MotionRoot";
import PageLoader from "@/components/ui/PageLoader";

export default function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:font-bold focus:text-black">
        Skip to content
      </a>
      <MotionRoot />
      <AnnouncementBar />
      <Navbar />
      {/* The hero sits under the transparent navbar, so pages pull up by its height */}
      <main id="main" className="-mt-18 flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <PlayerHost />
      <ScrollRestoration />
    </div>
  );
}
