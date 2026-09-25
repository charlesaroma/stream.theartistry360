/* Motion Root */
import { useEffect } from "react";

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * The runtime half of the "Light & Lens" motion language (CSS lives in
 * index.css). One set of document listeners for the whole app; renders only
 * the SVG filter the ember drops need.
 *
 * - Molten glass: any [data-glass] tracks the pointer in --mx / --my.
 * - Ember press: any .ember spills a molten drop from the contact point.
 * - Iris: every press records its position on <html> for the next route's
 *   view transition to open from.
 */
export default function MotionRoot() {
  useEffect(() => {
    let frame = 0;
    const onMove = (e) => {
      const glass = e.target instanceof Element ? e.target.closest("[data-glass]") : null;
      if (!glass || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = glass.getBoundingClientRect();
        glass.style.setProperty("--mx", `${e.clientX - r.left}px`);
        glass.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };

    const bloom = (el, x, y) => {
      if (reduced()) return;
      const r = el.getBoundingClientRect();
      const layer = document.createElement("span");
      layer.className = "ember-layer";
      layer.setAttribute("aria-hidden", "true");
      const size = Math.max(r.width, r.height) * 2.2;
      const make = (satellite, dx = 0, dy = 0) => {
        const d = document.createElement("span");
        d.className = satellite ? "ember-drop is-satellite" : "ember-drop";
        // Coordinates are relative to the layer, which is inset -20%.
        d.style.left = `${x - r.left + r.width * 0.2}px`;
        d.style.top = `${y - r.top + r.height * 0.2}px`;
        d.style.setProperty("--ember-size", `${size}px`);
        d.style.setProperty("--dx", `${dx}px`);
        d.style.setProperty("--dy", `${dy}px`);
        layer.appendChild(d);
      };
      make(false);
      // Two droplets break away, so the drop reads as liquid, not a ripple.
      const a = Math.random() * Math.PI * 2;
      make(true, Math.cos(a) * r.width * 0.45, Math.sin(a) * r.height * 0.9);
      make(true, Math.cos(a + 2.4) * r.width * 0.35, Math.sin(a + 2.4) * r.height * 0.8);
      el.appendChild(layer);
      setTimeout(() => layer.remove(), 800);
    };

    const press = (el, x, y) => {
      el.classList.add("is-pressing");
      bloom(el, x, y);
      const release = () => el.classList.remove("is-pressing");
      window.addEventListener("pointerup", release, { once: true });
      window.addEventListener("pointercancel", release, { once: true });
      setTimeout(release, 600);
    };

    const onDown = (e) => {
      document.documentElement.style.setProperty("--iris-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--iris-y", `${e.clientY}px`);
      const el = e.target instanceof Element ? e.target.closest(".ember") : null;
      if (el && !el.disabled && el.getAttribute("aria-disabled") !== "true") press(el, e.clientX, e.clientY);
    };

    const onKey = (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = e.target instanceof Element ? e.target.closest(".ember") : null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      document.documentElement.style.setProperty("--iris-x", `${r.left + r.width / 2}px`);
      document.documentElement.style.setProperty("--iris-y", `${r.top + r.height / 2}px`);
      press(el, r.left + r.width / 2, r.top + r.height / 2);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        {/* Blur then threshold alpha: overlapping drops fuse like molten metal */}
        <filter id="ember-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
