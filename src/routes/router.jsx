/* Router */
import { createBrowserRouter } from "react-router-dom";

import { catalogQueries, reelsQueries, siteQueries } from "@/store/tanstackStore/queries/site";
import { queryClient } from "@/store/tanstackStore/queryClient";

import RouteError from "./RouteError";
import SiteLayout from "./SiteLayout";
import { pages } from "./pages";

// Data router: needed for <Link viewTransition>, which drives the iris.
const lazy = (load) => async () => ({ Component: (await load()).default });

// Loaders warm the cache while the page chunk downloads, so data and code
// arrive together. They never block: the page reads the same queries and
// shows its own loading and 404 states. Nothing is returned to the router.
const warm = (...options) => {
  options.forEach((o) => queryClient.query(o).catch(() => {}));
  return null;
};
const titleLoader = ({ params }) => warm(catalogQueries.title(params.id), catalogQueries.titles());

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: lazy(pages.home), loader: () => warm(siteQueries.settings(), catalogQueries.titles()) },
      { path: "films", lazy: lazy(pages.films), loader: () => warm(catalogQueries.titles(), catalogQueries.types(), catalogQueries.categories()) },
      { path: "reels", lazy: lazy(pages.reels), loader: () => warm(reelsQueries.list()) },
      { path: "plans", lazy: lazy(pages.plans), loader: () => warm(siteQueries.plans()) },
      { path: "my-list", lazy: lazy(pages.myList) },
      { path: "title/:id", lazy: lazy(pages.title), loader: titleLoader },
      { path: "watch/:id", lazy: lazy(pages.watch), loader: titleLoader },
      { path: "search", lazy: lazy(pages.search) },
      { path: "sign-in", lazy: lazy(pages.signIn) },
      { path: "sign-up", lazy: lazy(pages.signUp) },
      { path: "*", lazy: lazy(pages.notFound) },
    ],
  },
]);
