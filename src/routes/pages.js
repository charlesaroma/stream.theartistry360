/* Page Chunks */
// Every page is its own chunk, loaded by the router on first visit.
// Strictly streaming: no class timetable or academy pages live here.
export const pages = {
  home: () => import("@/pages/2.home/home"),
  films: () => import("@/pages/3.films/films"),
  reels: () => import("@/pages/4.reels/reels"),
  plans: () => import("@/pages/5.plans/plans"),
  myList: () => import("@/pages/6.my-list/my-list"),
  title: () => import("@/pages/8.title/title"),
  watch: () => import("@/pages/9.watch/watch"),
  search: () => import("@/pages/7.search/search"),
  signIn: () => import("@/pages/1.auth/sign-in"),
  signUp: () => import("@/pages/1.auth/sign-up"),
  notFound: () => import("@/pages/not-found"),
};
