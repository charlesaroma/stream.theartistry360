/* Form Field */
import { useId } from "react";

export default function Field({ label, error, hint, input, ...rest }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-semibold text-text-secondary">{label}</label>
      <input id={id} className="input" aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-e` : undefined} {...input} {...rest} />
      {hint && !error && <p className="text-caption text-text-muted">{hint}</p>}
      {error && <p id={`${id}-e`} role="alert" className="text-caption font-semibold text-danger">{error}</p>}
    </div>
  );
}
