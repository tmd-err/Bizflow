import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";

export interface Customer {
  id: number;
  company_id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  tax_number?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CustomerPayload = Omit<Customer, "id" | "company_id" | "created_at" | "updated_at">;

export function getCustomersRequest(search?: string) { return apiGet<{ customers: Customer[] }>(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`); }
export function getCustomerRequest(id: number) { return apiGet<{ customer: Customer }>(`/api/customers/${id}`); }
export function createCustomerRequest(data: CustomerPayload) { return apiPost<{ message: string; customer: Customer }>("/api/customers", data); }
export function updateCustomerRequest(id: number, data: CustomerPayload) { return apiPatch<{ message: string; customer: Customer }>(`/api/customers/${id}`, data); }
export function deleteCustomerRequest(id: number) { return apiDelete<{ message: string }>(`/api/customers/${id}`); }
