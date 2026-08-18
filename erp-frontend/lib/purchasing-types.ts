export interface Supplier {
  id: number;
  company_id: number;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_number: string | null;
  notes: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  addresses?: SupplierAddress[];
  contacts?: SupplierContact[];
}

export interface SupplierAddress {
  id: number;
  company_id: number;
  supplier_id: number;
  label: string | null;
  address: string;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierContact {
  id: number;
  company_id: number;
  supplier_id: number;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrder {
  id: number;
  company_id: number;
  supplier_id: number;
  warehouse_id: number;
  reference: string;
  order_date: string | null;
  expected_date: string | null;
  status: "draft" | "ordered" | "partially_received" | "received" | "cancelled";
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  supplier?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string; code: string };
  creator?: { id: number; name: string };
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  subtotal: number;
  total: number;
  received_quantity: number;
  created_at?: string;
  updated_at?: string;
  product?: { id: number; name: string; sku: string };
}

export interface PurchaseInvoice {
  id: number;
  company_id: number;
  supplier_id: number;
  purchase_order_id: number | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  paid_amount: number;
  status: "unpaid" | "partially_paid" | "paid" | "cancelled";
  notes: string | null;
  payment_notes: string | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  supplier?: { id: number; name: string; code: string };
  purchaseOrder?: { id: number; reference: string };
  creator?: { id: number; name: string };
  items?: PurchaseInvoiceItem[];
  payments?: SupplierPayment[];
}

export interface PurchaseInvoiceItem {
  id: number;
  purchase_invoice_id: number;
  purchase_order_item_id: number | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  subtotal: number;
  total: number;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierPayment {
  id: number;
  company_id: number;
  supplier_invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  creator?: { id: number; name: string };
}

export interface DeliveryReceipt {
  id: number;
  company_id: number;
  supplier_id: number;
  purchase_order_id: number | null;
  warehouse_id: number;
  reference: string;
  receipt_date: string;
  status: "draft" | "received" | "returned";
  notes: string | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  supplier?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string; code: string };
  purchaseOrder?: { id: number; reference: string };
  creator?: { id: number; name: string };
  items?: DeliveryReceiptItem[];
  items_count?: number;
}

export interface DeliveryReceiptItem {
  id: number;
  company_id: number;
  delivery_receipt_id: number;
  purchase_order_item_id: number | null;
  product_id: number;
  description: string | null;
  ordered_qty: number;
  received_qty: number;
  unit: string | null;
  created_at?: string;
  updated_at?: string;
  product?: { id: number; name: string; sku: string };
}