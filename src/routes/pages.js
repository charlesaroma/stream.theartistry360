/* Page Chunks */
// Every page is its own chunk, loaded by the router on first visit.
// Strictly streaming: no class timetable or academy pages live here.
export const pages = {
  home: () => import("@/pages/1.home/home"),
  films: () => import("@/pages/2.films/films"),
  plans: () => import("@/pages/3.plans/plans"),
  myList: () => import("@/pages/4.my-list/my-list"),
  title: () => import("@/pages/title/title"),
  watch: () => import("@/pages/watch/watch"),
  search: () => import("@/pages/search/search"),
  signIn: () => import("@/pages/auth/sign-in"),
  signUp: () => import("@/pages/auth/sign-up"),
  notFound: () => import("@/pages/not-found"),
};
