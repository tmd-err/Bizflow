import { apiPost } from "@/lib/api/client";
import type { CompanySetupFormData } from "@/app/features/onboarding/schemas";

export interface CompanyPayload {
  name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  tax_number?: string;
  address?: string;
  city?: string;
  country?: string;
  currency: string;
  logo?: string;
}

export interface CompanyResponse {
  message: string;
  company: {
    id: number;
    name: string;
    legal_name?: string | null;
    email?: string | null;
    phone?: string | null;
    tax_number?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    currency: string;
    logo?: string | null;
  };
}

export const companyFieldMap = {
  name: "companyName",
  legal_name: "legalName",
  email: "email",
  phone: "phone",
  tax_number: "taxNumber",
  address: "address",
  city: "city",
  country: "country",
  currency: "currency",
  logo: "logo",
} as const;

export function mapCompanyFormToPayload(
  data: CompanySetupFormData
): CompanyPayload {
  const payload: CompanyPayload = {
    name: data.companyName,
    currency: data.currency,
  };

  if (data.legalName.trim()) payload.legal_name = data.legalName;
  if (data.email.trim()) payload.email = data.email;
  if (data.phone.trim()) payload.phone = data.phone;
  if (data.taxNumber.trim()) payload.tax_number = data.taxNumber;
  if (data.address.trim()) payload.address = data.address;
  if (data.city.trim()) payload.city = data.city;
  if (data.country.trim()) payload.country = data.country;

  return payload;
}

export async function createCompanyRequest(data: CompanySetupFormData) {
  return apiPost<CompanyResponse>("/api/company", mapCompanyFormToPayload(data));
}
