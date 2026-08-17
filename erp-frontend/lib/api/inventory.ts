import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api/client";
import type {
  StockAdjustment,
  StockAdjustmentItem,
  StockTransfer,
  StockTransferItem,
  Warehouse,
  WarehouseLocation,
  StockMovement,
  InventoryDashboardStats,
} from "@/lib/inventory-types";

/* ── Warehouse ─────────────────────────────────────────────────────────── */

export async function getWarehousesRequest() {
  const r = await apiGet<{ warehouses: Warehouse[] }>("/api/warehouses");
  return r.warehouses;
}

export async function getWarehouseRequest(id: number) {
  const r = await apiGet<{ warehouse: Warehouse & { locations: WarehouseLocation[] } }>(
    `/api/warehouses/${id}`
  );
  return r.warehouse;
}

export async function createWarehouseRequest(data: {
  code: string;
  name: string;
  address?: string;
  city?: string;
}) {
  return apiPost<{ message: string; warehouse: Warehouse }>(
    "/api/warehouses",
    data
  );
}

export async function updateWarehouseRequest(
  id: number,
  data: Partial<{
    code: string;
    name: string;
    address: string;
    city: string;
    is_active: boolean;
  }>
) {
  return apiPost<{ message: string; warehouse: Warehouse }>(
    `/api/warehouses/${id}`,
    { ...data, _method: "PATCH" }
  );
}

export async function deleteWarehouseRequest(id: number) {
  return apiDelete<{ message: string }>(`/api/warehouses/${id}`);
}

/* ── Warehouse Locations ──────────────────────────────────────────────── */

export async function getWarehouseLocationsRequest(warehouseId: number) {
  const r = await apiGet<{ locations: WarehouseLocation[] }>(
    `/api/warehouses/${warehouseId}/locations`
  );
  return r.locations;
}

export async function createWarehouseLocationRequest(
  warehouseId: number,
  data: { code: string; name: string }
) {
  return apiPost<{ message: string; location: WarehouseLocation }>(
    `/api/warehouses/${warehouseId}/locations`,
    data
  );
}

export async function updateWarehouseLocationRequest(
  locationId: number,
  data: { code?: string; name?: string }
) {
  return apiPost<{ message: string; location: WarehouseLocation }>(
    `/api/locations/${locationId}`,
    { ...data, _method: "PATCH" }
  );
}

export async function deleteWarehouseLocationRequest(locationId: number) {
  return apiDelete<{ message: string }>(`/api/locations/${locationId}`);
}

/* ── Stock Overview ──────────────────────────────────────────────────── */

export async function getStockOverviewRequest(warehouseId?: number) {
  const qs = warehouseId ? `?warehouse_id=${warehouseId}` : "";
  const r = await apiGet<{
    stock: Array<{
      product_id: number;
      product_name: string;
      product_sku: string;
      warehouse_id: number;
      warehouse_name: string;
      location_id: number | null;
      location_name: string;
      quantity: number;
      minimum_stock: number;
      status: "in_stock" | "low_stock" | "out_of_stock";
    }>;
    warehouses: Array<{ id: number; name: string }>;
  }>(`/api/inventory/stock${qs}`);
  return r;
}

/* ── Stock Movements ─────────────────────────────────────────────────── */

export async function getStockMovementsRequest(filters?: {
  product_id?: number;
  warehouse_id?: number;
  type?: string;
  from_date?: string;
  to_date?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.product_id)
    params.set("product_id", String(filters.product_id));
  if (filters?.warehouse_id)
    params.set("warehouse_id", String(filters.warehouse_id));
  if (filters?.type) params.set("type", filters.type);
  if (filters?.from_date) params.set("from_date", filters.from_date);
  if (filters?.to_date) params.set("to_date", filters.to_date);
  const qs = params.toString();
  const r = await apiGet<{ movements: StockMovement[] }>(
    `/api/inventory/movements${qs ? `?${qs}` : ""}`
  );
  return r.movements;
}

/* ── Stock Adjustments ───────────────────────────────────────────────── */

export async function getAdjustmentsRequest() {
  const r = await apiGet<{
    adjustments: (StockAdjustment & { items: StockAdjustmentItem[] })[];
  }>("/api/inventory/adjustments");
  return r.adjustments;
}

export async function getAdjustmentRequest(id: number) {
  const r = await apiGet<{
    adjustment: (StockAdjustment & { items: StockAdjustmentItem[] });
  }>(`/api/inventory/adjustments/${id}`);
  return r.adjustment;
}

export interface AdjustmentItemInput {
  product_id: number;
  system_quantity: number;
  actual_quantity: number;
}

export async function createAdjustmentRequest(data: {
  warehouse_id: number;
  reference: string;
  reason?: string;
  items: AdjustmentItemInput[];
}) {
  return apiPost<{ message: string; adjustment: StockAdjustment }>(
    "/api/inventory/adjustments",
    data
  );
}

/* ── Stock Transfers ─────────────────────────────────────────────────── */

export async function getTransfersRequest() {
  const r = await apiGet<{
    transfers: (StockTransfer & { items: StockTransferItem[] })[];
  }>("/api/inventory/transfers");
  return r.transfers;
}

export async function getTransferRequest(id: number) {
  const r = await apiGet<{
    transfer: (StockTransfer & { items: StockTransferItem[] });
  }>(`/api/inventory/transfers/${id}`);
  return r.transfer;
}

export interface TransferItemInput {
  product_id: number;
  quantity: number;
}

export async function createTransferRequest(data: {
  from_warehouse_id: number;
  to_warehouse_id: number;
  reference: string;
  status?: string;
  items: TransferItemInput[];
}) {
  return apiPost<{ message: string; transfer: StockTransfer }>(
    "/api/inventory/transfers",
    data
  );
}

export async function completeTransferRequest(id: number) {
  return apiPatch<{ message: string; transfer: StockTransfer }>(
    `/api/inventory/transfers/${id}/complete`,
    { status: "completed" }
  );
}

/* ── Dashboard ────────────────────────────────────────────────────────── */

export async function getInventoryDashboardRequest() {
  const r = await apiGet<{
    stats: InventoryDashboardStats;
    low_stock: Array<{ id: number; name: string; sku: string }>;
    out_of_stock: Array<{ id: number; name: string; sku: string }>;
  }>("/api/inventory");
  return r;
}

/* ── Re-exports (convenience) ───────────────────────────────────────────── */

export type {
  Warehouse,
  WarehouseLocation,
  StockMovement,
  StockAdjustment,
  StockAdjustmentItem,
  StockTransfer,
  StockTransferItem,
  InventoryDashboardStats,
} from "@/lib/inventory-types";