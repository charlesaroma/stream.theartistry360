/* Route Error */
import { Link, useRouteError } from "react-router-dom";

import Logo from "@/assets/images/Logo.png";

/**
 * Shown when a page throws, instead of the router's developer screen. The
 * detail is kept for development only.
 */
export default function RouteError() {
  const error = useRouteError();
  const is404 = error?.status === 404;

  return (
    <main className="shell grid min-h-dvh place-items-center text-center">
      <div className="max-w-md">
        <img src={Logo} alt="The Artistry360" className="mx-auto mb-10 h-9 w-auto" />
        <p className="eyebrow mb-4">{is404 ? "404" : "Something went wrong"}</p>
        <h1 className="text-title">{is404 ? "This reel is missing" : "We lost the picture"}</h1>
        <p className="mt-4 text-lead text-text-secondary">
          {is404 ? "The page moved or never existed." : "Try again, or head back home while we look into it."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!is404 && (
            <button type="button" onClick={() => window.location.reload()} className="btn btn-primary ember">Try again</button>
          )}
          <Link to="/" className="btn border border-border-subtle text-text-primary hover:border-brand">Back to home</Link>
        </div>
        {import.meta.env.DEV && error?.message && (
          <pre className="mt-10 overflow-x-auto rounded-2xl bg-surface-card p-4 text-left text-caption text-text-muted">{error.message}</pre>
        )}
      </div>
    </main>
  );
}
