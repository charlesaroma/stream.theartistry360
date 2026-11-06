/* Premiere Banner */
// On a title page: "Premiering on <date>" with a ticket link and "Watch now".
// Watch now is the normal way in (sign in, pay the fee, play), available
// before the premiere too: the point is to catch people who can't wait. The
// banner disappears once the date has passed. The fee is the title's own,
// which the client can change any time.
import { useState } from "react";
import { CalendarClock, Play, Ticket } from "lucide-react";

import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberContext";
import PlayGate from "@/pages/7.title/sections/PlayGate";
import { accessFor, premiereOf } from "@/utils/access";
import { formatUGX } from "@/utils/formatCurrency";

const WHEN = { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" };

export default function PremiereBanner({ title, className }) {
  const { member } = useMember();
  const [gate, setGate] = useState(false);
  const premiere = premiereOf(title.access);
  if (title.access?.tier !== "ppv" || !premiere.upcoming) return null;
  // Already bought: Play above is enough, so no second Watch now.
  const canWatch = accessFor(title, member).ok;

  return (
    <section aria-label="Premiere" className={className}>
      <div className="flex flex-col gap-4 rounded-3xl border border-brand/30 bg-black/50 p-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <CalendarClock className="mt-1 h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
          <div className="min-w-0">
            <p className="eyebrow">Premiering</p>
            <p className="text-lead font-semibold">{premiere.at.toLocaleString("en-GB", WHEN)}</p>
            <p className="mt-1 text-small text-text-secondary">Can't wait? Watch it now, before the premiere.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 [&>*]:flex-1 sm:[&>*]:flex-none">
          {premiere.ticketUrl && (
            <Button variant="glass" href={premiere.ticketUrl}>
              <Ticket className="h-5 w-5" aria-hidden="true" /> Buy a ticket
            </Button>
          )}
          {!canWatch && (
            <Button variant="light" onClick={() => setGate(true)}>
              <Play className="h-5 w-5 fill-current" aria-hidden="true" /> Watch now · {formatUGX(title.access.priceUGX)}
            </Button>
          )}
        </div>
      </div>
      <PlayGate title={title} open={gate} onClose={() => setGate(false)} />
    </section>
  );
}
