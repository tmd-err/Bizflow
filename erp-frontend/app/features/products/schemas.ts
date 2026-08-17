import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(100),
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().max(5000).optional().default(""),
  unit: z.string().min(1, "Unit is required").max(50),
  cost_price: z.coerce.number().min(0, "Price cannot be negative"),
  selling_price: z.coerce.number().min(0, "Price cannot be negative"),
  tax_rate: z.coerce.number().min(0, "Tax cannot be negative").max(100, "Tax cannot exceed 100%").optional().default(0),
  is_active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;