/* Router */
import { createBrowserRouter } from "react-router-dom";

import SiteLayout from "./SiteLayout";
import { pages } from "./pages";

// Data router: needed for <Link viewTransition>, which drives the iris.
const lazy = (load) => async () => ({ Component: (await load()).default });

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, lazy: lazy(pages.home) },
      { path: "films", lazy: lazy(pages.films) },
      { path: "plans", lazy: lazy(pages.plans) },
      { path: "my-list", lazy: lazy(pages.myList) },
      { path: "title/:id", lazy: lazy(pages.title) },
      { path: "search", lazy: lazy(pages.search) },
      { path: "sign-in", lazy: lazy(pages.signIn) },
      { path: "sign-up", lazy: lazy(pages.signUp) },
      { path: "*", lazy: lazy(pages.notFound) },
    ],
  },
  // The player is full screen, outside the site chrome.
  { path: "watch/:id", lazy: lazy(pages.watch) },
]);
