import { z } from "zod";

const optionalLogoSchema = z
  .custom<File | undefined>((value) => {
    if (value === undefined || value === null) return true;
    return value instanceof File;
  }, "Logo must be a valid file")
  .optional();

export const companySetupSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters"),
  legalName: z
    .string()
    .min(2, "Legal name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(6, "Please enter a valid phone number"),
  taxNumber: z.string().min(1, "Tax number is required"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  currency: z.string().min(3, "Please select a currency"),
  logo: optionalLogoSchema,
});

export type CompanySetupFormData = z.infer<typeof companySetupSchema>;

export const companyIdentitySchema = companySetupSchema.pick({
  companyName: true,
  legalName: true,
  logo: true,
});

export const companyContactSchema = companySetupSchema.pick({
  email: true,
  phone: true,
});

export const companyLocationSchema = companySetupSchema.pick({
  address: true,
  city: true,
  country: true,
});

export const companyBusinessSchema = companySetupSchema.pick({
  taxNumber: true,
  currency: true,
});

export const companySetupSteps = [
  {
    id: "identity",
    title: "Company identity",
    description: "How your business appears on BizFlow.",
    schema: companyIdentitySchema,
    fields: ["companyName", "legalName", "logo"] as const,
  },
  {
    id: "contact",
    title: "Contact details",
    description: "How customers and partners reach you.",
    schema: companyContactSchema,
    fields: ["email", "phone"] as const,
  },
  {
    id: "location",
    title: "Business address",
    description: "Where your company is registered or operates.",
    schema: companyLocationSchema,
    fields: ["address", "city", "country"] as const,
  },
  {
    id: "business",
    title: "Business settings",
    description: "Tax and billing preferences for your workspace.",
    schema: companyBusinessSchema,
    fields: ["taxNumber", "currency"] as const,
  },
] as const;

export const currencies = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "MAD", label: "MAD — Moroccan Dirham" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "CHF", label: "CHF — Swiss Franc" },
  { value: "JPY", label: "JPY — Japanese Yen" },
] as const;

export const countries = [
  "Morocco",
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Canada",
  "United Arab Emirates",
  "Saudi Arabia",
  "Other",
] as const;
