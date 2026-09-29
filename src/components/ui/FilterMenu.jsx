/* Filter Menu */
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * A small filter button that opens its options: a dropdown under the button
 * on larger screens, a bottom sheet on phones. Single choice, with "Any" to
 * clear it. Closes on a choice, Escape, or a click outside.
 */
export default function FilterMenu({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const id = useId();
  const chosen = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !box.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (next) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-small font-semibold transition-colors",
          chosen ? "border-brand/60 bg-brand/10 text-text-primary" : "border-border-subtle text-text-secondary hover:border-border-hover hover:text-text-primary",
        )}
      >
        {label}
        {chosen && <span className="text-brand">· {chosen.label}</span>}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <>
          {/* Phones: a dimmed page under a bottom sheet */}
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden" aria-hidden="true" />
          <div
            id={id}
            role="group"
            aria-label={label}
            className="fixed inset-x-0 bottom-0 z-50 animate-rise rounded-t-3xl border-t border-white/10 bg-surface-elevated p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgb(0_0_0/0.6)] md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:top-full md:mt-2 md:w-60 md:rounded-2xl md:border md:p-2 md:pb-2"
          >
            <p className="px-3 pb-2 pt-1 text-caption font-semibold uppercase tracking-[0.18em] text-text-muted md:hidden">{label}</p>
            {[{ id: "", label: "Any" }, ...options].map((o) => (
              <button
                key={o.id || "any"}
                type="button"
                aria-pressed={value === o.id}
                onClick={() => pick(o.id)}
                className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-small text-text-primary hover:bg-white/6"
              >
                {o.label}
                {value === o.id && <Check className="h-4 w-4 text-brand" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
