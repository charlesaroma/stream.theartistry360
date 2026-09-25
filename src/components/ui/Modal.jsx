/* Modal */
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/utils/cn";

export default function Modal({ open, onClose, title, children, className }) {
  const id = useId();
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        data-glass=""
        className={cn("molten-glass relative w-full max-w-lg animate-rise rounded-t-4xl p-6 sm:rounded-4xl sm:p-8", className)}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id={id} className="text-heading">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-icon -mr-2 -mt-2 h-11 w-11 hover:bg-white/10">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
