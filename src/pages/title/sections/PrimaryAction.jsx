/* Primary Action */
import { useState } from "react";
import { Crown, LogIn, Play, ShoppingBag } from "lucide-react";

import Button from "@/components/ui/Button";
import { useMember } from "@/context/MemberContext";
import { useProgress } from "@/hooks/useLibrary";
import { accessFor } from "@/utils/access";
import { formatUGX } from "@/utils/formatCurrency";
import BuyDialog from "./BuyDialog";

/** One clear next step, decided by the title's access tier and the member. */
export default function PrimaryAction({ title }) {
  const { member } = useMember();
  const { progress } = useProgress();
  const [buying, setBuying] = useState(false);
  const access = accessFor(title, member);
  const resume = progress[title.id];

  if (access.ok)
    return (
      <Button variant="light" to={`/watch/${title.id}`}>
        <Play className="h-5 w-5 fill-current" aria-hidden="true" /> {resume ? "Resume" : "Play"}
      </Button>
    );
  if (access.reason === "signin")
    return (
      <Button to={`/sign-in?next=/title/${title.id}`}>
        <LogIn className="h-5 w-5" aria-hidden="true" /> {title.access.tier === "free" ? "Sign up free to watch" : "Sign in to watch"}
      </Button>
    );
  if (access.reason === "subscribe")
    return (
      <Button to={`/plans?next=/title/${title.id}`}>
        <Crown className="h-5 w-5" aria-hidden="true" /> Subscribe to watch
      </Button>
    );
  return (
    <>
      <Button onClick={() => setBuying(true)}>
        <ShoppingBag className="h-5 w-5" aria-hidden="true" /> Watch for {formatUGX(title.access.priceUGX)}
      </Button>
      <BuyDialog title={title} open={buying} onClose={() => setBuying(false)} />
    </>
  );
}
