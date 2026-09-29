/* Account Menu */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Crown, ListVideo, LogOut, Settings } from "lucide-react";

import { useMember } from "@/store/context/MemberContext";
import { cn } from "@/utils/cn";

const item =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-small font-semibold text-text-secondary transition-colors hover:bg-white/8 hover:text-text-primary";

/** The avatar opens this menu; signing out is one deliberate choice inside it. */
export default function AccountMenu() {
  const { member, signOut } = useMember();
  const [open, setOpen] = useState(false);
  const subscribed = member.subscription?.status === "active";

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full pl-1 pr-3 text-text-secondary transition-colors hover:text-text-primary"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand font-bold text-black">{member.name.charAt(0).toUpperCase()}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>

      {/* Click-catcher: any press outside the menu closes it, deterministically */}
      {open && <div className="fixed inset-0 z-40" onPointerDown={close} aria-hidden="true" />}
      {open && (
        <div role="menu" data-glass="" className="molten-glass absolute right-0 top-full z-50 mt-3 w-72 animate-rise rounded-3xl bg-surface-elevated/80 p-2">
          <div className="px-3 pb-3 pt-2">
            <p className="truncate text-small font-bold text-text-primary">{member.name}</p>
            <p className="truncate text-caption text-text-muted">{member.email}</p>
            <p className={cn("chip mt-3", subscribed ? "bg-brand/15 text-brand-300" : "bg-white/10 text-text-secondary")}>
              <Crown className="h-3 w-3" aria-hidden="true" /> {subscribed ? "Subscriber" : "Free member"}
            </p>
          </div>
          <div className="border-t border-white/10 pt-2">
            <Link role="menuitem" to="/my-list" viewTransition onClick={close} className={item}>
              <ListVideo className="h-4 w-4" aria-hidden="true" /> My List
            </Link>
            <Link role="menuitem" to={subscribed ? "/account?tab=membership" : "/plans"} viewTransition onClick={close} className={item}>
              <Crown className="h-4 w-4" aria-hidden="true" /> {subscribed ? "Manage plan" : "Upgrade to watch everything"}
            </Link>
            <Link role="menuitem" to="/account" viewTransition onClick={close} className={item}>
              <Settings className="h-4 w-4" aria-hidden="true" /> Account &amp; settings
            </Link>
          </div>
          <div className="mt-2 border-t border-white/10 pt-2">
            <button role="menuitem" type="button" onClick={() => { close(); signOut(); }} className={cn(item, "hover:bg-danger/10 hover:text-danger")}>
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
