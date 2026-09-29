/* Navbar */
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";

import Logo from "@/assets/images/Logo.png";
import IconButton from "@/components/ui/IconButton";
import { useMember } from "@/store/context/MemberContext";
import { cn } from "@/utils/cn";
import AccountMenu from "./AccountMenu";
import { NAV_ITEMS } from "./navMenu";

// Loaded on first open, so search costs nothing until someone uses it.
const SearchDialog = lazy(() => import("@/components/search/SearchDialog"));

/**
 * Floats as clear glass over the hero and firms up once the page scrolls, so
 * artwork breathes at the top and links stay legible below it.
 */
export default function Navbar() {
  const { member, signOut } = useMember();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  // "/" or Cmd/Ctrl+K opens search from anywhere, unless you're typing.
  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearching(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkClass = ({ isActive }) =>
    cn("relative inline-flex min-h-11 items-center px-3 text-small font-semibold transition-colors", isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary");

  return (
    <header className="sticky top-0 z-40">
      <div className={cn("transition-[background-color,backdrop-filter,box-shadow] duration-500", solid ? "bg-surface-primary/80 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl" : "bg-linear-to-b from-black/70 to-transparent")}>
        <nav aria-label="Main" className="shell flex h-18 items-center gap-6">
          <Link to="/" viewTransition className="flex min-h-11 shrink-0 items-center gap-3" aria-label="Artistry360 Stream home">
            <img src={Logo} alt="" className="h-8 w-auto" />
            <span className="hidden text-caption font-bold uppercase tracking-[0.25em] text-text-secondary sm:inline">Stream</span>
          </Link>

          <ul className="hidden items-center lg:flex">
            {NAV_ITEMS.map((i) => (
              <li key={i.to}>
                <NavLink to={i.to} end={i.end} viewTransition className={linkClass}>
                  {({ isActive }) => (
                    <>
                      {i.label}
                      <span className={cn("absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand transition-transform duration-300", isActive ? "scale-x-100" : "scale-x-0")} />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            <IconButton label="Search (/ or ⌘K)" onClick={() => setSearching(true)} className="h-11 w-11" aria-haspopup="dialog">
              <Search className="h-5 w-5" aria-hidden="true" />
            </IconButton>
            {member ? (
              <AccountMenu />
            ) : (
              <Link to="/sign-in" viewTransition className="btn btn-primary ember hidden min-h-11 px-5 sm:inline-flex">Sign in</Link>
            )}
            <IconButton label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)} className="h-11 w-11 lg:hidden" aria-expanded={open} aria-controls="mobile-nav">
              {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </IconButton>
          </div>
        </nav>
      </div>

      {searching && (
        <Suspense fallback={null}>
          <SearchDialog onClose={() => setSearching(false)} />
        </Suspense>
      )}

      {/* Mobile Sheet */}
      <div
        id="mobile-nav"
        inert={!open}
        className={cn("fixed inset-x-0 top-18 bottom-0 z-40 bg-surface-primary/95 backdrop-blur-xl transition-opacity duration-300 lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
      >
        <ul className="shell flex flex-col gap-1 py-6">
          {NAV_ITEMS.map((i, n) => (
            <li key={i.to} className={cn("transition-all duration-500", open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")} style={{ transitionDelay: open ? `${n * 50}ms` : "0ms" }}>
              <NavLink to={i.to} end={i.end} viewTransition onClick={() => setOpen(false)} className={({ isActive }) => cn("flex min-h-14 items-center text-heading", isActive ? "text-brand" : "text-text-primary")}>
                {i.label}
              </NavLink>
            </li>
          ))}
          <li className="mt-6">
            {member ? (
              <button type="button" onClick={() => { signOut(); setOpen(false); }} className="btn btn-glass molten-glass relative w-full" data-glass="">Sign out</button>
            ) : (
              <Link to="/sign-in" viewTransition onClick={() => setOpen(false)} className="btn btn-primary ember w-full">Sign in</Link>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}
