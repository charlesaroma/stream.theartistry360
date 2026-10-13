/* Profile And Sign-in */
import { useState } from "react";
import { LogOut, MailCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberContext";
import PasswordCard from "./PasswordCard";
import { Card, Status } from "./ui";

const input = "w-full rounded-2xl border border-white/10 bg-surface-primary px-4 py-3 text-body text-text-primary focus:border-brand focus:outline-none";
const label = "mb-2 block text-caption font-bold uppercase tracking-[0.12em] text-text-secondary";

/** Security: name and phone, email (changed through a confirmation link), password (PasswordCard), and signing out everywhere. */
export default function ProfilePanel() {
  const { member, updateProfile, requestEmailChange, signOutEverywhere } = useMember();
  const [profile, setProfile] = useState({ name: member.name, phone: member.phone ?? "" });
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState("");

  const act = (key, fn, ok) => async (e) => {
    e.preventDefault();
    setBusy(key);
    setMsg({});
    try {
      await fn();
      setMsg({ [key]: { ok } });
    } catch (err) {
      setMsg({ [key]: { error: err.message } });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Profile" description="Your name shows on your comments. Your phone is only used if we need to reach you about a payment, and is never shown to others.">
        <form onSubmit={act("profile", () => updateProfile(profile), "Saved.")} className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <label><span className={label}>Name</span><input className={input} value={profile.name} maxLength={60} autoComplete="name" onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
          <label><span className={label}>Phone</span><input className={input} type="tel" value={profile.phone} autoComplete="tel" placeholder="+256 772 000 000" onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
          <div className="sm:col-span-2"><Button type="submit" loading={busy === "profile"}>Save profile</Button><Status {...msg.profile} /></div>
        </form>
      </Card>

      <Card title="Email" description={`You sign in with ${member.email}.`}>
        {member.pendingEmail && (
          <p className="mb-4 flex items-center gap-2 rounded-2xl bg-info/10 px-4 py-3 text-small text-info">
            <MailCheck className="h-4 w-4" aria-hidden="true" /> We sent a link to {member.pendingEmail}. Your email changes when you open it.
          </p>
        )}
        <form onSubmit={act("email", () => requestEmailChange(email).then(() => setEmail("")), "Check your new inbox for the confirmation link.")} className="flex max-w-2xl flex-wrap gap-3">
          <label className="min-w-60 flex-1"><span className="sr-only">New email</span><input className={input} type="email" value={email} placeholder="New email address" autoComplete="email" onChange={(e) => setEmail(e.target.value)} /></label>
          <Button type="submit" variant="glass" loading={busy === "email"} disabled={!email}>Change email</Button>
        </form>
        <Status {...msg.email} />
      </Card>

      <PasswordCard />

      <Card title="Devices" description="Lost a phone, or signed in on a shared computer? Sign out everywhere; you'll sign in again on this device.">
        <Button variant="glass" onClick={() => signOutEverywhere()}><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out of all devices</Button>
      </Card>
    </div>
  );
}
