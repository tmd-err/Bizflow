import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().max(500, "Description is too long").optional(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
