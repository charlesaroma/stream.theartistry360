/* Account And Settings */
import { Navigate, useSearchParams } from "react-router-dom";
import { Crown, History, Lock, MonitorPlay, ShieldCheck } from "lucide-react";

import PageLoader from "@/components/ui/PageLoader";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useMember } from "@/store/context/MemberContext";
import { cn } from "@/utils/cn";
import ActivityPanel from "./sections/ActivityPanel";
import MembershipPanel from "./sections/MembershipPanel";
import PlaybackPanel from "./sections/PlaybackPanel";
import PrivacyPanel from "./sections/PrivacyPanel";
import ProfilePanel from "./sections/ProfilePanel";

const TABS = [
  { id: "membership", label: "Membership", icon: Crown, Panel: MembershipPanel },
  { id: "security", label: "Security", icon: ShieldCheck, Panel: ProfilePanel },
  { id: "playback", label: "Playback", icon: MonitorPlay, Panel: PlaybackPanel },
  { id: "activity", label: "Viewing activity", icon: History, Panel: ActivityPanel },
  { id: "privacy", label: "Privacy & data", icon: Lock, Panel: PrivacyPanel },
];
// Older links (from before the tabs were merged) still land in the right place.
const MOVED = { subscription: "membership", purchases: "membership", profile: "security" };

/**
 * /account?tab=…: Membership, Security, Playback, Viewing activity, Privacy
 * & data, the same set most streaming services offer. Tabs sit
 * in a column on desktop and scroll sideways on phones. Signed out, it asks
 * you to sign in and comes back here.
 */
export default function AccountPage() {
  usePageMeta({ title: "Account & settings" });
  const { member, loading } = useMember();
  const [params, setParams] = useSearchParams();
  const asked = params.get("tab");
  const tab = TABS.find((t) => t.id === (MOVED[asked] ?? asked)) ?? TABS[0];

  if (loading) return <PageLoader />;
  if (!member) return <Navigate to={`/sign-in?next=${encodeURIComponent(`/account?tab=${tab.id}`)}`} replace />;

  return (
    <div className="shell pb-[clamp(3rem,6vw,6rem)] pt-[calc(4.5rem+2rem)]">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Account</p>
          <h1 className="text-title">Account &amp; settings</h1>
        </div>
        <p className="text-small text-text-muted">{member.email}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Account sections" className="-mx-[clamp(1rem,4vw,3.5rem)] overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex gap-2 lg:sticky lg:top-24 lg:flex-col lg:gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  aria-current={tab.id === id ? "page" : undefined}
                  onClick={() => setParams({ tab: id }, { replace: true })}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-full px-4 text-small font-semibold transition-colors lg:rounded-xl",
                    tab.id === id ? "bg-brand/15 text-brand" : "text-text-secondary hover:bg-white/6 hover:text-text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div key={tab.id} className="min-w-0 animate-rise">
          <tab.Panel />
        </div>
      </div>
    </div>
  );
}
