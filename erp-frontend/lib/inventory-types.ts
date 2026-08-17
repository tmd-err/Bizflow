/**
 * Shared inventory types used by the API client and page components.
 */

export interface Warehouse {
  id: number;
  company_id: number;
  code: string;
  name: string;
  address: string | null;
  city: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseLocation {
  id: number;
  warehouse_id: number;
  code: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id: number;
  company_id: number;
  product_id: number;
  warehouse_id: number;
  location_id: number | null;
  type: string;
  quantity: string;
  unit_cost: string | null;
  reference_type: string | null;
  reference_id: number | null;
  created_by: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: { id: number; sku: string; name: string };
  warehouse?: { id: number; name: string };
  location?: { id: number; name: string };
  createdBy?: { id: number; name: string };
}

export interface StockAdjustment {
  id: number;
  company_id: number;
  warehouse_id: number;
  reference: string;
  reason: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  warehouse?: { id: number; name: string };
  items?: StockAdjustmentItem[];
  createdBy?: { id: number; name: string };
}

export interface StockAdjustmentItem {
  id: number;
  stock_adjustment_id: number;
  product_id: number;
  system_quantity: string;
  actual_quantity: string;
  difference: string;
  created_at: string;
  updated_at: string;
  product?: { id: number; sku: string; name: string };
}

export interface StockTransfer {
  id: number;
  company_id: number;
  from_warehouse_id: number;
  to_warehouse_id: number;
  reference: string;
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  fromWarehouse?: { id: number; name: string };
  toWarehouse?: { id: number; name: string };
  items?: StockTransferItem[];
  createdBy?: { id: number; name: string };
}

export interface StockTransferItem {
  id: number;
  stock_transfer_id: number;
  product_id: number;
  quantity: string;
  created_at: string;
  updated_at: string;
  product?: { id: number; sku: string; name: string };
}

export interface InventoryDashboardStats {
  total_products_with_stock: number;
  total_stock_quantity: number;
  low_stock_count: number;
  out_of_stock_count: number;
  stock_value: number;
}

export interface StockOverviewRow {
  product_id: number;
  product_name: string;
  product_sku: string;
  warehouse_id: number;
  warehouse_name: string;
  location_id: number | null;
  location_name: string;
  quantity: number;
  minimum_stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}