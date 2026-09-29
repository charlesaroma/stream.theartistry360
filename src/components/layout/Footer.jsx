/* Footer */
import { Link } from "react-router-dom";

import BrandLogo from "@/components/ui/brand/BrandLogo";
import { Instagram, TikTok, WhatsApp, YouTube } from "@/components/ui/BrandIcons";
import { useSite } from "@/store/tanstackStore/queries/site";

const COLUMNS = [
  { title: "Watch", links: [["Home", "/"], ["Films", "/films"], ["My List", "/my-list"]] },
  { title: "Account", links: [["Plans", "/plans"], ["Sign in", "/sign-in"], ["Create account", "/sign-up"]] },
  { title: "The Artistry360", links: [["Academy & classes", "https://theartistry360.com/classes"], ["Voting", "https://theartistry360.com/voting"], ["Contact", "https://theartistry360.com/contact"]] },
];

export default function Footer() {
  const { data: site } = useSite();
  const wa = site?.community?.channelUrl || site?.community?.groupUrl;

  return (
    <footer className="mt-auto border-t border-border-default bg-surface-secondary">
      <div className="shell grid grid-cols-2 gap-10 py-16 md:grid-cols-5">
        <div className="col-span-2">
          <BrandLogo label="The Artistry360" className="h-10 w-auto" />
          <p className="mt-4 max-w-xs text-small text-text-muted">Films, shorts and replays from The Artistry360, Kampala.</p>
          <div className="mt-6 flex gap-2">
            {[
              ["TikTok", TikTok, "https://www.tiktok.com/@theartistry360"],
              ["Instagram", Instagram, "https://www.instagram.com/theartistry360"],
              ["YouTube", YouTube, "https://www.youtube.com/@theartistry360"],
              ...(wa ? [["WhatsApp", WhatsApp, wa]] : []),
            ].map(([label, Icon, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full border border-border-subtle text-text-secondary transition-colors hover:border-brand hover:text-brand">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-4 text-caption font-bold uppercase tracking-[0.18em] text-text-muted">{col.title}</h2>
            <ul className="flex flex-col">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  {to.startsWith("http") ? (
                    <a href={to} className="inline-flex min-h-11 items-center text-small text-text-secondary hover:text-text-primary">{label}</a>
                  ) : (
                    <Link to={to} viewTransition className="inline-flex min-h-11 items-center text-small text-text-secondary hover:text-text-primary">{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="shell flex flex-col gap-2 border-t border-border-default py-6 text-caption text-text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Thee Artistry360 (U) SMC Ltd. All rights reserved.</p>
        <p>Payments by PesaPal · MTN MoMo · Airtel Money · Visa · Mastercard</p>
      </div>
    </footer>
  );
}
