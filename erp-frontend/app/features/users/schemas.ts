import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    email: z.email("Enter a valid email address").max(255),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
    role_ids: z.array(z.number()),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
