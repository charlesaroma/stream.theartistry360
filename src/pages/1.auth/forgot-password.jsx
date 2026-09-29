/* Forgot Password */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useMember } from "@/store/context/MemberContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import AuthFrame from "./AuthFrame";
import { forgotSchema } from "./schemas";

/**
 * Asks for a reset link. The answer is the same whether or not the email has
 * an account, so nobody can use this page to check who is a member.
 */
export default function ForgotPasswordPage() {
  usePageMeta({ title: "Reset your password" });
  const { requestPasswordReset, demo } = useMember();
  const [sentTo, setSentTo] = useState("");
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(forgotSchema) });

  const submit = handleSubmit(async ({ email }) => {
    setServerError("");
    try {
      await requestPasswordReset({ email });
      setSentTo(email);
    } catch (e) {
      setServerError(e.message);
    }
  });

  const back = <>Remembered it? <Link to="/sign-in" viewTransition className="font-bold text-brand">Sign in</Link></>;

  if (sentTo) {
    return (
      <AuthFrame title="Check your email" footer={back}>
        <div className="flex flex-col items-center gap-4 text-center">
          <MailCheck className="h-12 w-12 text-brand" aria-hidden="true" />
          <p className="text-body text-text-secondary">
            If an account exists for <span className="font-semibold text-text-primary">{sentTo}</span>, we've sent a link to reset the password. It works once, for 30 minutes.
          </p>
          <p className="text-small text-text-muted">No email? Check spam, or signed up with Google? Use Continue with Google instead.</p>
          {demo && (
            <Link to="/reset-password?token=demo" className="text-small font-bold text-brand hover:underline">Demo: open the reset link</Link>
          )}
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Forgot your password?" lead="Enter the email you signed up with and we'll send you a link to set a new one." footer={back}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field label="Email" type="email" autoComplete="email" input={register("email")} error={errors.email?.message} />
        {serverError && <p role="alert" className="text-small font-semibold text-danger">{serverError}</p>}
        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">Send reset link</Button>
      </form>
    </AuthFrame>
  );
}
