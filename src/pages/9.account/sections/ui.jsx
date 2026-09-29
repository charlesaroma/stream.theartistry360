/* Account UI */
import { cn } from "@/utils/cn";

/** One settings block: heading, a line of explanation, then its controls. */
export function Card({ title, description, children, tone, className }) {
  return (
    <section className={cn("rounded-3xl border p-5 md:p-7", tone === "danger" ? "border-danger/30 bg-danger/5" : "border-white/8 bg-surface-card/60", className)}>
      <h2 className="text-subheading font-bold">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-small text-text-secondary">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** A labelled on/off switch with a hint under it. */
export function SwitchRow({ label, hint, checked, onChange, disabled }) {
  return (
    <label className={cn("flex items-start justify-between gap-6 py-3", disabled ? "opacity-50" : "cursor-pointer")}>
      <span>
        <span className="block text-body font-semibold text-text-primary">{label}</span>
        {hint && <span className="mt-0.5 block text-small text-text-muted">{hint}</span>}
      </span>
      <span className="relative mt-1 inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-white/15 transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

/** Saved / error line under a form. */
export function Status({ ok, error }) {
  if (error) return <p role="alert" className="mt-3 text-small font-semibold text-danger">{error}</p>;
  if (ok) return <p role="status" className="mt-3 text-small font-semibold text-success">{ok}</p>;
  return null;
}

