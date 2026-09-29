/* Reel Viewer (Vertical Feed) */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import { useMember } from "@/store/context/MemberContext";
import { useTitles } from "@/store/tanstackStore/queries/site";
import { accessFor } from "@/utils/access";
import ReelSlide from "./ReelSlide";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Immersive vertical reels. The feed is a scroll-snap column, one reel per
 * screen, so the mouse wheel, a trackpad, touch swipes and the keyboard
 * (↑/↓, Page Up/Down) all move between reels natively, momentum included.
 * Whichever reel is mostly in view plays; the rest rest on their posters.
 */
export default function ReelViewer({ open, reels = [], activeIndex = 0, onClose, onNavigate }) {
  const scroller = useRef(null);
  const [index, setIndex] = useState(activeIndex);
  const [muted, setMuted] = useState(true);
  const [likedMap, setLikedMap] = useState({});
  const { member } = useMember();
  const { data: titles = [] } = useTitles();

  // Opening starts on the reel that was chosen.
  const [wasOpen, setWasOpen] = useState(open);
  const [startIndex, setStartIndex] = useState(activeIndex);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setIndex(activeIndex);
      setStartIndex(activeIndex);
    }
  }

  const goTo = (i) => {
    if (i < 0 || i >= reels.length) return;
    scroller.current?.children[i]?.scrollIntoView({ block: "start", behavior: reducedMotion() ? "instant" : "smooth" });
  };

  // Place the feed on the chosen reel, then treat whichever reel is mostly in
  // view as the active one. The feed can mount hidden (a Suspense boundary
  // still revealing the page, where every size reads 0), so both wait until
  // it has a height; otherwise the observer would report the top reel.
  useEffect(() => {
    const root = scroller.current;
    if (!open || !root) return undefined;
    let io = null;
    const begin = () => {
      root.scrollTop = root.children[startIndex]?.offsetTop ?? 0;
      root.focus({ preventScroll: true });
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const i = Number(entry.target.dataset.index);
            setIndex(i);
            onNavigate?.(i);
          }
        },
        { root, threshold: 0.6 },
      );
      [...root.children].forEach((child) => io.observe(child));
    };
    const sized = new ResizeObserver(() => {
      if (!io && root.clientHeight > 0) begin();
    });
    sized.observe(root);
    return () => {
      sized.disconnect();
      io?.disconnect();
    };
  }, [open, startIndex, reels.length, onNavigate]);

  // Esc closes; ↑/↓ step one reel (scroll-snap alone would let them nudge).
  // The page behind stays still while the feed is open.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      else if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); goTo(index + 1); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); goTo(index - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  });

  if (!open || !reels.length) return null;

  // The linked title as the catalogue names it, and where "Scene from …"
  // leads: into the title at the scene if this member may watch it, else to
  // its page (sign in, subscribe or buy).
  const filmFor = (reel) => {
    if (!reel.titleId) return null;
    const title = titles.find((t) => t.id === reel.titleId);
    const canWatch = Boolean(title && accessFor(title, member).ok);
    return {
      name: title?.title ?? reel.titleName ?? "the full title",
      titleTo: `/title/${reel.titleId}`,
      sceneTo: canWatch ? `/watch/${reel.titleId}?t=${reel.clip.start}` : `/title/${reel.titleId}`,
      canWatch,
    };
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Reels" className="fixed inset-0 z-100 animate-fade bg-black/90 backdrop-blur-xl">
      <div
        ref={scroller}
        tabIndex={-1}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain outline-none"
      >
        {reels.map((reel, i) => (
          <section
            key={reel.id}
            data-index={i}
            // A click on the backdrop beside the reel closes, as before.
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
            className="flex h-dvh snap-start snap-always items-center justify-center md:py-[4vh]"
          >
            <ReelSlide
              reel={reel}
              index={i}
              total={reels.length}
              active={i === index}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              liked={Boolean(likedMap[reel.id])}
              onToggleLike={() => setLikedMap((m) => ({ ...m, [reel.id]: !m[reel.id] }))}
              film={filmFor(reel)}
              onClose={onClose}
            />
          </section>
        ))}
      </div>

      {/* Desktop: step buttons beside the reel (scrolling works too) */}
      <div className="pointer-events-none fixed inset-y-0 left-1/2 hidden md:block">
        <div className="pointer-events-auto absolute left-[calc(26vh+1.5rem)] top-1/2 flex -translate-y-1/2 flex-col gap-3">
          <IconButton label="Previous reel (↑)" onClick={() => goTo(index - 1)} disabled={index === 0} className="h-12 w-12 disabled:opacity-30">
            <ChevronUp className="h-6 w-6" aria-hidden="true" />
          </IconButton>
          <IconButton label="Next reel (↓)" onClick={() => goTo(index + 1)} disabled={index === reels.length - 1} className="h-12 w-12 disabled:opacity-30">
            <ChevronDown className="h-6 w-6" aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
