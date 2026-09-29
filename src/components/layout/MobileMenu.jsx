/* Mobile Menu */
import { Link, NavLink } from "react-router-dom";

import { useMember } from "@/store/context/MemberContext";
import { cn } from "@/utils/cn";
import { NAV_ITEMS } from "./navMenu";

// Same menu as theartistry360.com: full screen, centred, staggered in by
// transition delays (no JS per frame). The header stays on top with its X.
const stagger = (open, i) => ({
  transitionDelay: open ? `${i * 60}ms` : "0ms",
  opacity: open ? 1 : 0,
  transform: open ? "translateY(0)" : "translateY(12px)",
});

export default function MobileMenu({ open, onClose }) {
  const { member, signOut } = useMember();

  return (
    <div
      id="mobile-nav"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed inset-0 z-30 flex flex-col items-center justify-center bg-surface-primary transition-opacity duration-400 ease-out lg:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-brand/8 blur-[100px]" />

      <ul className="flex flex-col items-center gap-4">
        {NAV_ITEMS.map((item, i) => (
          <li key={item.to} className="transition-all duration-500 ease-out" style={stagger(open, i)}>
            <NavLink
              to={item.to}
              end={item.end}
              viewTransition
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "inline-flex min-h-11 items-center text-lg font-semibold uppercase tracking-[0.2em] transition-colors duration-200",
                  isActive ? "text-brand" : "text-text-secondary hover:text-text-primary",
                )
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-center gap-4 transition-all duration-500 ease-out" style={stagger(open, NAV_ITEMS.length + 1)}>
        {member ? (
          <>
            <p className="text-caption uppercase tracking-[0.15em] text-text-muted">Signed in as {member.name}</p>
            <button
              type="button"
              onClick={() => { signOut(); onClose(); }}
              className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-8 text-xs font-bold uppercase tracking-[0.15em] text-text-primary transition-colors hover:border-brand hover:text-brand"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/sign-in"
            viewTransition
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-full bg-brand px-8 text-xs font-bold uppercase tracking-[0.15em] text-surface-primary shadow-[0_2px_16px_color-mix(in_oklab,var(--color-brand)_30%,transparent)] transition-colors hover:bg-brand-light"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
