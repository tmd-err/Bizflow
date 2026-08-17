import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters"),

    email: z
      .string()
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    password_confirmation: z
      .string()
      .min(8, "Please confirm your password"),
  })
  .refine(
    (data) => data.password === data.password_confirmation,
    {
      message: "Passwords do not match",
      path: ["password_confirmation"],
    }
  );

  //code pour validation d'email - cas d'utilisation: oubli de mot de passe
  export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    token: z.string().min(1, "Reset token is missing"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    password_confirmation: z
      .string()
      .min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;