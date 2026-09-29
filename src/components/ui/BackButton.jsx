/* Back Button */
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * Goes back one step in this site's history. Someone who landed here from
 * outside (a shared link) has nowhere in-app to go back to, so they go home.
 */
export default function BackButton({ className, label = "Back" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasHistory = location.key !== "default";

  return (
    <button
      type="button"
      onClick={() => (hasHistory ? navigate(-1, { viewTransition: true }) : navigate("/", { viewTransition: true }))}
      data-glass=""
      className={cn(
        "molten-glass ember relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full pl-3 pr-4 text-small font-semibold text-text-primary",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {hasHistory ? label : "Home"}
    </button>
  );
}
