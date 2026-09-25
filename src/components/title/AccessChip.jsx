/* Access Chip */
import { Crown, Lock, Sparkles } from "lucide-react";

import { cn } from "@/utils/cn";
import { formatUGX } from "@/utils/formatCurrency";

export default function AccessChip({ access, className }) {
  const tier = access?.tier;
  if (tier === "free")
    return <span className={cn("chip bg-success/15 text-success", className)}><Sparkles className="h-3 w-3" aria-hidden="true" />Free</span>;
  if (tier === "ppv")
    return <span className={cn("chip bg-gold/15 text-gold", className)}><Lock className="h-3 w-3" aria-hidden="true" />{formatUGX(access.priceUGX)}</span>;
  return <span className={cn("chip bg-brand/15 text-brand-300", className)}><Crown className="h-3 w-3" aria-hidden="true" />Subscribers</span>;
}
