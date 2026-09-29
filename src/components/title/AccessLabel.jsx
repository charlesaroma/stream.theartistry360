/* Access Label */
import { Check, Crown, Lock, Sparkles, Ticket } from "lucide-react";

import { useMember } from "@/store/context/MemberContext";
import { accessLabel } from "@/utils/access";
import { cn } from "@/utils/cn";

const ICONS = { free: Sparkles, subscribers: Crown, price: Lock, included: Check, owned: Ticket };
const TONES = { free: "text-success", subscribers: "text-brand", price: "text-gold", included: "text-success", owned: "text-success" };

/**
 * A card's access, on a solid dark label so it reads over any poster, and
 * worded for whoever is looking (see accessLabel): Free / Subscribers / the
 * price for visitors, "Included" for subscribers, "Owned" once bought.
 */
export default function AccessLabel({ title, className }) {
  const { member } = useMember();
  const label = accessLabel(title, member);
  if (!label) return null;
  const Icon = ICONS[label.kind];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md bg-black/85 px-1.5 py-0.5 text-caption font-semibold text-text-primary", className)}>
      <Icon className={cn("h-3.5 w-3.5", TONES[label.kind])} aria-hidden="true" />
      {label.text}
    </span>
  );
}
