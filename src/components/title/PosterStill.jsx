/* Poster Still */
import { cn } from "@/utils/cn";

/**
 * The title's poster in a wide frame, whole and uncropped, over a blurred
 * copy of itself that fills the sides. The hover preview uses it so it
 * shows the very picture on the card that was hovered.
 */
export default function PosterStill({ src, className }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <img src={src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-2xl" />
      <img src={src} alt="" className={cn("relative mx-auto h-full w-auto max-w-none object-contain", className)} />
    </div>
  );
}
