import { z } from "zod";

const email = z.string().trim().min(1, "Enter your email.").email("Enter a valid email.");
export const signInSchema = z.object({ email, password: z.string().min(1, "Enter your password.") });
export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email,
  password: z.string().min(8, "Use at least 8 characters."),
});
export const forgotSchema = z.object({ email });
export const resetSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters.").max(128, "Keep it under 128 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The passwords don't match." });
