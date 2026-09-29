/* Notifications */
import { useState } from "react";
import { Link } from "react-router-dom";

import { useMember } from "@/store/context/MemberContext";
import { useAccountSettings } from "@/store/tanstackStore/queries/member";
import { cn } from "@/utils/cn";
import { Card, Status, SwitchRow } from "./ui";

/** What we tell you about, and where: email, WhatsApp or both. */
export default function NotificationsPanel() {
  const { member } = useMember();
  const { settings, saveNotifications } = useAccountSettings();
  const n = settings.notifications;
  const [error, setError] = useState("");
  const save = (patch) => saveNotifications(patch).then(() => setError("")).catch((e) => setError(e.message));
  const needsPhone = n.channel !== "email" && !member.phone;

  return (
    <Card title="Notifications" description="We only send what you choose here. Every message has a way to stop it.">
      <div className="max-w-2xl divide-y divide-white/8">
        <SwitchRow label="New releases" hint="A note when new films land (about twice a month)." checked={n.newReleases} onChange={(v) => save({ newReleases: v })} />
        <SwitchRow label="New episodes" hint="When a series in My List gets a new episode." checked={n.newEpisodes} onChange={(v) => save({ newEpisodes: v })} />
        <SwitchRow label="Payments and renewals" hint="Receipts, and a reminder 3 days before your plan renews." checked={n.payments} onChange={(v) => save({ payments: v })} />
      </div>
      <fieldset className="mt-6">
        <legend className="mb-3 text-caption font-bold uppercase tracking-[0.12em] text-text-secondary">Send them by</legend>
        <div className="flex flex-wrap gap-2">
          {[["email", "Email"], ["whatsapp", "WhatsApp"], ["both", "Both"]].map(([v, l]) => (
            <label key={v} className={cn("inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 text-small font-semibold transition-colors", n.channel === v ? "border-brand bg-brand/10 text-brand" : "border-white/10 text-text-secondary hover:border-white/25")}>
              <input type="radio" name="channel" value={v} checked={n.channel === v} onChange={() => save({ channel: v })} className="sr-only" />
              {l}
            </label>
          ))}
        </div>
        {needsPhone && <p className="mt-3 text-small text-warning">Add your phone number in <Link to="/account?tab=profile" className="font-semibold underline">Profile</Link> to get WhatsApp messages.</p>}
      </fieldset>
      <Status error={error} />
    </Card>
  );
}
