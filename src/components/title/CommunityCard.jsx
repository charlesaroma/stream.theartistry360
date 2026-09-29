/* Community Card */
import { Megaphone, Users } from "lucide-react";

import { WhatsApp } from "@/components/ui/BrandIcons";
import { useSite } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

/**
 * The Client's request: every film page invites viewers into the WhatsApp
 * Channel (broadcast) and Group (conversation). Links come from the Studio,
 * Streaming › Stream Site. A link not yet set shows as "Coming soon".
 */
export default function CommunityCard({ className }) {
  const { data: site } = useSite();
  const c = site?.community;
  if (!c?.enabled) return null;

  const action = (href, label, Icon, solid) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "ember flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-small font-bold transition-colors",
          solid ? "bg-whatsapp text-black hover:brightness-110 [--ember-color:#1fae55] [--ember-core:#d9ffe8]" : "border border-whatsapp/50 text-whatsapp hover:bg-whatsapp/10 [--ember-color:#25d366]",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" /> {label}
      </a>
    ) : (
      <span className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-dashed border-white/15 px-5 text-small font-bold text-text-muted" aria-disabled="true">
        <Icon className="h-4 w-4" aria-hidden="true" /> {label}
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-caption">Soon</span>
      </span>
    );

  return (
    <aside data-glass="" aria-labelledby="community-heading" className={cn("molten-glass relative overflow-hidden rounded-3xl p-6 md:p-8", className)}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-whatsapp/20 blur-3xl" aria-hidden="true" />
      <div className="mb-6 flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-whatsapp text-black shadow-[0_8px_24px_color-mix(in_oklab,var(--color-whatsapp)_40%,transparent)]">
          <WhatsApp className="h-6 w-6" />
        </span>
        <div>
          <h2 id="community-heading" className="text-subheading font-bold">{c.heading}</h2>
          {c.body && <p className="text-small text-text-secondary">{c.body}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {action(c.channelUrl, "Follow the Channel", Megaphone, true)}
        {action(c.groupUrl, "Join the Group", Users, false)}
      </div>
    </aside>
  );
}
