import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  email_verification_code: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const sendEmailCodeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type SendEmailCodeFormData = z.infer<typeof sendEmailCodeSchema>;

export const updatePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    password_confirmation: z
      .string()
      .min(8, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
