/* Button */
import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/utils/cn";

const VARIANTS = {
  primary: "btn btn-primary ember",
  light: "btn btn-light ember [--ember-color:var(--color-brand)]",
  glass: "btn btn-glass molten-glass ember",
};

/**
 * Every button spills an ember on press (MotionRoot). `to` renders a router
 * Link with the iris view transition; `href` an external anchor.
 */
const Button = forwardRef(function Button({ variant = "primary", to, href, loading, className, children, ...rest }, ref) {
  const cls = cn(VARIANTS[variant], className);
  const glass = variant === "glass" ? { "data-glass": "" } : {};
  const body = (
    <>
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );
  if (to) return <Link ref={ref} to={to} viewTransition className={cls} {...glass} {...rest}>{body}</Link>;
  if (href) return <a ref={ref} href={href} target="_blank" rel="noreferrer" className={cls} {...glass} {...rest}>{body}</a>;
  return (
    <button ref={ref} type="button" className={cls} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...glass} {...rest}>
      {body}
    </button>
  );
});

export default Button;
