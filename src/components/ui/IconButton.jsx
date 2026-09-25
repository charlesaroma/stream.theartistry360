/* Icon Button */
import { cn } from "@/utils/cn";

/** Round glass control for icons (play, add to list, share, arrows). */
export default function IconButton({ label, className, children, pressed, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      data-glass=""
      className={cn("btn-icon molten-glass ember relative", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
