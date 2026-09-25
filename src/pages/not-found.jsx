/* Not Found */
import Button from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <section className="shell grid min-h-[80dvh] place-items-center pt-18 text-center">
      <div>
        <p className="eyebrow mb-4">404</p>
        <h1 className="text-title">This reel is missing</h1>
        <p className="mt-4 text-lead text-text-secondary">The page moved or never existed.</p>
        <Button to="/" className="mt-8">Back to home</Button>
      </div>
    </section>
  );
}
