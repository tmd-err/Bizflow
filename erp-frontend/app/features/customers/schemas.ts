import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Customer name must be at least 2 characters").max(255),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  phone: z.string().max(50),
  address: z.string().max(255),
  city: z.string().max(100),
  country: z.string().max(100),
  tax_number: z.string().max(100),
  notes: z.string().max(5000),
  is_active: z.boolean(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
