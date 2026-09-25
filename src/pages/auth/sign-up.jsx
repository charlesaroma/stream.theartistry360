/* Sign Up */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useMember } from "@/context/MemberContext";
import AuthFrame from "./AuthFrame";
import { signUpSchema } from "./schemas";

export default function SignUpPage() {
  const { signUp } = useMember();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [serverError, setServerError] = useState("");
  const next = params.get("next") || "/";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(signUpSchema) });

  const submit = handleSubmit(async (v) => {
    setServerError("");
    try {
      await signUp(v);
      navigate(next, { replace: true, viewTransition: true });
    } catch (e) {
      setServerError(e.message);
    }
  });

  return (
    <AuthFrame title="Create your free account" lead="Watch selected titles free today. Upgrade any time for the whole library." footer={<>Already a member? <Link to={`/sign-in?next=${encodeURIComponent(next)}`} viewTransition className="font-bold text-brand">Sign in</Link></>}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field label="Name" autoComplete="name" input={register("name")} error={errors.name?.message} />
        <Field label="Email" type="email" autoComplete="email" input={register("email")} error={errors.email?.message} />
        <Field label="Password" type="password" autoComplete="new-password" input={register("password")} error={errors.password?.message} hint="At least 8 characters." />
        {serverError && <p role="alert" className="text-small font-semibold text-danger">{serverError}</p>}
        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">Create account</Button>
        <p className="text-center text-caption text-text-muted">Phone number and Google sign-in arrive with the backend.</p>
      </form>
    </AuthFrame>
  );
}
