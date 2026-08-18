import {
  apiDelete,
  apiGet,
  apiPost,
  apiPatch,
} from "@/lib/api/client";
import type {
  Supplier,
  SupplierAddress,
  SupplierContact,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseInvoice,
  PurchaseInvoiceItem,
  SupplierPayment,
} from "@/lib/purchasing-types";
/* ── Suppliers ─────────────────────────────────────────────────────────── */

export async function getSuppliersRequest() {
  const r = await apiGet<{ suppliers: Supplier[] }>("/api/suppliers");
  return r.suppliers;
}

export async function getSupplierRequest(id: number) {
  const r = await apiGet<{ supplier: Supplier & { addresses: SupplierAddress[]; contacts: SupplierContact[] } }>(
    `/api/suppliers/${id}`
  );
  return r.supplier;
}

export async function createSupplierRequest(data: {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_number?: string;
  notes?: string;
}) {
  return apiPost<{ message: string; supplier: Supplier }>("/api/suppliers", data);
}

export async function updateSupplierRequest(
  id: number,
  data: Partial<{
    code: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    tax_number: string;
    notes: string;
    is_active: boolean;
  }>
) {
  return apiPatch<{ message: string; supplier: Supplier }>(
    `/api/suppliers/${id}`,
    data
  );
}

export async function deactivateSupplierRequest(id: number) {
  return apiDelete<{ message: string }>(`/api/suppliers/${id}`);
}

export async function reactivateSupplierRequest(id: number) {
  return apiPatch<{ message: string; supplier: Supplier }>(
    `/api/suppliers/${id}/reactivate`,
    {}
  );
}

/* ── Purchase Orders ──────────────────────────────────────────────────── */

export async function getPurchaseOrdersRequest() {
  const r = await apiGet<{ purchase_orders: PurchaseOrder[] }>("/api/purchase-orders");
  return r.purchase_orders;
}

export async function getPurchaseOrderRequest(id: number) {
  const r = await apiGet<{ purchase_order: PurchaseOrder & { items: PurchaseOrderItem[] } }>(
    `/api/purchase-orders/${id}`
  );
  return r.purchase_order;
}

export async function createPurchaseOrderRequest(data: {
  supplier_id: number;
  warehouse_id: number;
  reference: string;
  order_date?: string;
  expected_date?: string;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
  }[];
}) {
  return apiPost<{ message: string; purchase_order: PurchaseOrder }>("/api/purchase-orders", data);
}

export async function updatePurchaseOrderRequest(
  id: number,
  data: {
    order_date?: string;
    expected_date?: string;
    notes?: string;
    status?: string;
  }
) {
  return apiPatch<{ message: string; purchase_order: PurchaseOrder }>(
    `/api/purchase-orders/${id}`,
    data
  );
}

export async function markPurchaseOrderAsOrdered(id: number) {
  return apiPatch<{ message: string; purchase_order: PurchaseOrder }>(
    `/api/purchase-orders/${id}/order`,
    {}
  );
}

export async function cancelPurchaseOrderRequest(id: number) {
  return apiPatch<{ message: string; purchase_order: PurchaseOrder }>(
    `/api/purchase-orders/${id}/cancel`,
    {}
  );
}

export async function receivePurchaseOrderRequest(
  id: number,
  items: { purchase_order_item_id: number; quantity: number }[]
) {
  return apiPost<{ message: string; purchase_order: PurchaseOrder }>(
    `/api/purchase-orders/${id}/receive`,
    { items }
  );
}

/* ── Purchase Invoices ────────────────────────────────────────────────── */

export async function getPurchaseInvoicesRequest() {
  const r = await apiGet<{ purchase_invoices: PurchaseInvoice[] }>("/api/purchase-invoices");
  return r.purchase_invoices;
}

export async function getPurchaseInvoiceRequest(id: number) {
  const r = await apiGet<{ purchase_invoice: PurchaseInvoice & { items: PurchaseInvoiceItem[]; payments: SupplierPayment[] } }>(
    `/api/purchase-invoices/${id}`
  );
  return r.purchase_invoice;
}

export async function createPurchaseInvoiceRequest(data: {
  supplier_id: number;
  purchase_order_id?: number;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  notes?: string;
  items: {
    description: string;
    purchase_order_item_id?: number;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
  }[];
}) {
  return apiPost<{ message: string; purchase_invoice: PurchaseInvoice }>("/api/purchase-invoices", data);
}

export async function addInvoicePaymentRequest(
  id: number,
  data: {
    amount: number;
    payment_date?: string;
    payment_method?: string;
    reference?: string;
    notes?: string;
  }
) {
  return apiPost<{ message: string; purchase_invoice: PurchaseInvoice }>(
    `/api/purchase-invoices/${id}/payment`,
    data
  );
}

/* ── Re-exports ─────────────────────────────────────────────────────────── */

export async function getDeliveryReceiptsRequest() {
  const r = await apiGet<{ delivery_receipts: DeliveryReceipt[] }>("/api/delivery-receipts");
  return r.delivery_receipts;
}

export async function getDeliveryReceiptRequest(id: number) {
  const r = await apiGet<{ delivery_receipt: DeliveryReceipt & { items: DeliveryReceiptItem[] } }>(
    `/api/delivery-receipts/${id}`
  );
  return r.delivery_receipt;
}

export async function getWarehousesRequest() {
  const r = await apiGet<{ warehouses: { id: number; name: string; code: string }[] }>("/api/warehouses");
  return r.warehouses;
}

/* ── Re-exports ─────────────────────────────────────────────────────────── */

export type {
  Supplier,
  SupplierAddress,
  SupplierContact,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseInvoice,
  PurchaseInvoiceItem,
  SupplierPayment,
  DeliveryReceipt,
  DeliveryReceiptItem,
} from "@/lib/purchasing-types";