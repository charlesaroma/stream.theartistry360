/* Page Chunks */
// Every page is its own chunk, loaded by the router on first visit.
// Strictly streaming: no class timetable or academy pages live here.
export const pages = {
  home: () => import("@/pages/2.home/home"),
  films: () => import("@/pages/3.films/films"),
  plans: () => import("@/pages/4.plans/plans"),
  myList: () => import("@/pages/5.my-list/my-list"),
  title: () => import("@/pages/7.title/title"),
  watch: () => import("@/pages/8.watch/watch"),
  search: () => import("@/pages/6.search/search"),
  signIn: () => import("@/pages/1.auth/sign-in"),
  signUp: () => import("@/pages/1.auth/sign-up"),
  forgotPassword: () => import("@/pages/1.auth/forgot-password"),
  resetPassword: () => import("@/pages/1.auth/reset-password"),
  notFound: () => import("@/pages/not-found"),
};
