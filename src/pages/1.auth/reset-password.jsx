/* Reset Password */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { CircleCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useMember } from "@/store/context/MemberContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import AuthFrame from "./AuthFrame";
import { resetSchema } from "./schemas";

// Read the emailed token once, then take it out of the address bar so it
// isn't left in history or shown over someone's shoulder.
function takeToken() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token") ?? "";
  if (token) {
    url.searchParams.delete("token");
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }
  return token;
}

/** /reset-password?token=…: the page the emailed link opens. */
export default function ResetPasswordPage() {
  usePageMeta({ title: "Set a new password" });
  const { resetPassword } = useMember();
  const [token] = useState(takeToken);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(resetSchema) });

  const submit = handleSubmit(async ({ password }) => {
    setServerError("");
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch (e) {
      setServerError(e.message);
    }
  });

  if (!token) {
    return (
      <AuthFrame title="This link has expired" lead="Reset links work once, for 30 minutes.">
        <Button to="/forgot-password" className="w-full">Send a new link</Button>
      </AuthFrame>
    );
  }

  if (done) {
    return (
      <AuthFrame title="Password changed">
        <div className="flex flex-col items-center gap-4 text-center">
          <CircleCheck className="h-12 w-12 text-success" aria-hidden="true" />
          <p className="text-body text-text-secondary">You can sign in with your new password. Other devices have been signed out.</p>
          <Button to="/sign-in" className="w-full">Sign in</Button>
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Set a new password" footer={<Link to="/sign-in" viewTransition className="font-bold text-brand">Back to sign in</Link>}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field label="New password" type="password" autoComplete="new-password" input={register("password")} error={errors.password?.message} hint="At least 8 characters." />
        <Field label="Confirm new password" type="password" autoComplete="new-password" input={register("confirm")} error={errors.confirm?.message} />
        {serverError && <p role="alert" className="text-small font-semibold text-danger">{serverError}</p>}
        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">Save new password</Button>
      </form>
    </AuthFrame>
  );
}
