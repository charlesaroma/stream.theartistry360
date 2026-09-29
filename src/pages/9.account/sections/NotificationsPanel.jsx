/* Notifications */
import { useState } from "react";

import { useMember } from "@/store/context/MemberContext";
import { useAccountSettings } from "@/store/tanstackStore/queries/member";
import { Card, Status, SwitchRow } from "./ui";

/** Which emails we send you. Email is the only channel. */
export default function NotificationsPanel() {
  const { member } = useMember();
  const { settings, saveNotifications } = useAccountSettings();
  const n = settings.notifications;
  const [error, setError] = useState("");
  const save = (patch) => saveNotifications(patch).then(() => setError("")).catch((e) => setError(e.message));

  return (
    <Card title="Email notifications" description={`We send these to ${member.email}. We only send what you switch on, and every email has a link to stop it.`}>
      <div className="max-w-2xl divide-y divide-white/8">
        <SwitchRow label="New releases" hint="A note when new films land (about twice a month)." checked={n.newReleases} onChange={(v) => save({ newReleases: v })} />
        <SwitchRow label="New episodes" hint="When a series in My List gets a new episode." checked={n.newEpisodes} onChange={(v) => save({ newEpisodes: v })} />
        <SwitchRow label="Payments and renewals" hint="Receipts, and a reminder 3 days before your plan renews." checked={n.payments} onChange={(v) => save({ payments: v })} />
      </div>
      <Status error={error} />
    </Card>
  );
}
