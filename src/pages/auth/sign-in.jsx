/* Sign In */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useMember } from "@/context/MemberContext";
import AuthFrame from "./AuthFrame";
import { signInSchema } from "./schemas";

export default function SignInPage() {
  const { signIn } = useMember();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [serverError, setServerError] = useState("");
  const next = params.get("next") || "/";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(signInSchema) });

  const submit = handleSubmit(async (v) => {
    setServerError("");
    try {
      await signIn(v);
      navigate(next, { replace: true, viewTransition: true });
    } catch (e) {
      setServerError(e.message);
    }
  });

  return (
    <AuthFrame title="Welcome back" lead="Sign in to watch and save titles to your list." footer={<>New here? <Link to={`/sign-up?next=${encodeURIComponent(next)}`} viewTransition className="font-bold text-brand">Create a free account</Link></>}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field label="Email" type="email" autoComplete="email" input={register("email")} error={errors.email?.message} />
        <Field label="Password" type="password" autoComplete="current-password" input={register("password")} error={errors.password?.message} />
        {serverError && <p role="alert" className="text-small font-semibold text-danger">{serverError}</p>}
        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">Sign in</Button>
      </form>
    </AuthFrame>
  );
}
