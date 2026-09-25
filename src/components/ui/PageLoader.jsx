/* Page Loader */
export default function PageLoader() {
  return (
    <div role="status" aria-label="Loading" className="grid min-h-dvh place-items-center">
      <span className="h-9 w-9 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  );
}
