/* Auth Frame */
import Logo from "@/assets/images/Logo.png";

const BACKDROP = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1600&h=900";

/** Glass card over a dimmed cinema still; same frame for sign in and sign up. */
export default function AuthFrame({ title, lead, children, footer }) {
  return (
    <section className="film-grain relative isolate grid min-h-dvh place-items-center overflow-hidden px-4 pb-16 pt-[calc(4.5rem+2rem)]">
      <img src={BACKDROP} alt="" className="absolute inset-0 -z-10 h-full w-full animate-kenburns object-cover opacity-40" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/70 to-black/40" />
      <div data-glass="" className="molten-glass relative w-full max-w-md animate-rise rounded-4xl p-8 sm:p-10">
        <img src={Logo} alt="" className="mb-8 h-9 w-auto" />
        <h1 className="text-heading">{title}</h1>
        {lead && <p className="mt-2 text-small text-text-secondary">{lead}</p>}
        <div className="mt-8">{children}</div>
        {footer && <p className="mt-8 text-center text-small text-text-secondary">{footer}</p>}
      </div>
    </section>
  );
}
