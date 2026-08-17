import { apiDelete, apiGet, apiPost } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";

// Internal DB field is cost_price; the API and UI use cost_price.
// Expose cost_price everywhere and map to cost_price on the wire.
export interface Product {
  id: number;
  company_id: number;
  sku: string;
  name: string;
  description: string | null;
  type: string;
  barcode: string | null;
  unit: string;
  cost_price: number;
  selling_price: string;
  tax_rate: string | null;
  minimum_stock: string;
  maximum_stock: string | null;
  image: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ProductPayload = Omit<
  Product,
  | "id"
  | "company_id"
  | "created_at"
  | "updated_at"
  | "type"
  | "barcode"
  | "cost_price"
  | "selling_price"
  | "tax_rate"
  | "minimum_stock"
  | "maximum_stock"
  | "image"
> & {
  cost_price: number;
  selling_price: number;
  tax_rate?: number | null;
  image?: File | null;
};

function toFormData(data: Partial<ProductPayload>, method?: "PATCH") {
  const formData = new FormData();

  if (method) {
    formData.append("_method", method);
  }

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(
      key,
      typeof value === "boolean" ? (value ? "1" : "0") : String(value)
    );
  });

  return formData;
}

export function getProductImageUrl(product: Pick<Product, "image" | "image_url">) {
  if (!product.image) return null;

  if (/^https?:\/\//i.test(product.image)) return product.image;

  return `${getApiBaseUrl()}/storage/${product.image.replace(/^\/+/, "")}`;
}

export function getProductsRequest(search?: string, isActive?: boolean) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive !== undefined) params.set("is_active", String(isActive));
  const qs = params.toString();
  return apiGet<{ products: Product[] }>(`/api/products${qs ? `?${qs}` : ""}`);
}

export function getProductRequest(id: number) {
  return apiGet<{ product: Product }>(`/api/products/${id}`);
}

export function createProductRequest(data: ProductPayload) {
  return apiPost<{ message: string; product: Product }>(
    "/api/products",
    toFormData(data)
  );
}

export function updateProductRequest(id: number, data: Partial<ProductPayload>) {
  return apiPost<{ message: string; product: Product }>(
    `/api/products/${id}`,
    toFormData(data, "PATCH")
  );
}

export function deleteProductRequest(id: number) {
  return apiDelete<{ message: string }>(`/api/products/${id}`);
}
