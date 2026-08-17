"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  createAdjustmentRequest,
  getWarehousesRequest,
  getStockOverviewRequest,
  type AdjustmentItemInput,
} from "@/lib/api/inventory";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Warehouse } from "@/lib/inventory-types";

export function AdjustmentsNewPageContent({ onDone }: { onDone?: () => void }) {
  const { showSuccess, showError } = useFormFeedback();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<
    Array<{ id: number; sku: string; name: string; minimum_stock: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [warehouseId, setWarehouseId] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [items, setItems] = useState<AdjustmentItemInput[]>([]);

  function addItem() {
    setItems([...items, { product_id: 0, system_quantity: 0, actual_quantity: 0 }]);
  }

  function updateItem(index: number, patch: Partial<AdjustmentItemInput>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  useEffect(() => {
    Promise.all([getWarehousesRequest(), getStockOverviewRequest()])
      .then(([whList, { stock }]) => {
        setWarehouses(whList);
        // Extract unique products from stock data
        const productMap = new Map<number, { id: number; sku: string; name: string; minimum_stock: number }>();
        for (const s of stock) {
          productMap.set(s.product_id, {
            id: s.product_id,
            sku: s.product_sku,
            name: s.product_name,
            minimum_stock: s.minimum_stock,
          });
        }
        setProducts(Array.from(productMap.values()));
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    if (!warehouseId || !reference || items.length === 0) {
      showError("Please fill in all required fields.");
      return;
    }

    const valid = items.every((i) => i.product_id > 0);
    if (!valid) {
      showError("Please select a product for each row.");
      return;
    }

    setSaving(true);
    try {
      await createAdjustmentRequest({
        warehouse_id: Number(warehouseId),
        reference,
        reason: reason || undefined,
        items,
      });
      showSuccess("Adjustment created successfully.");
      if (onDone) onDone();
      else window.location.href = "/dashboard/inventory/adjustments";
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to create adjustment."));
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner containerClassName="min-h-[60vh]" />;

  return (
    <>
      <PageHeader
        title="New Adjustment"
        description="Record a physical inventory count."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/inventory">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Warehouse *</label>
            <select
              className="w-full rounded-lg border bg-input px-3 py-2 text-sm text-foreground [&>option]:bg-popover [&>option]:text-popover-foreground"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reference *</label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. ADJ-001"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reason</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Physical count, damage, etc."
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <table className="min-w-full divide-y">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Product
                </th>
                <th className="px-4 py-3 text-right text-xs uppercase text-muted-foreground">
                  System Qty
                </th>
                <th className="px-4 py-3 text-right text-xs uppercase text-muted-foreground">
                  Actual Qty
                </th>
                <th className="px-4 py-3 text-right text-xs uppercase text-muted-foreground">
                  Difference
                </th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <select
                      className="w-full rounded-lg border bg-input px-3 py-2 text-sm text-foreground [&>option]:bg-popover [&>option]:text-popover-foreground"
                      value={item.product_id || ""}
                      onChange={(e) =>
                        updateItem(i, { product_id: Number(e.target.value) })
                      }
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {item.system_quantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Input
                      type="number"
                      step="0.001"
                      className="w-28 text-right"
                      value={item.actual_quantity || ""}
                      onChange={(e) =>
                        updateItem(i, {
                          actual_quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td
                    className={[
                      "px-4 py-3 text-right text-sm font-mono",
                      item.actual_quantity - item.system_quantity < 0
                        ? "text-red-600"
                        : item.actual_quantity - item.system_quantity > 0
                          ? "text-emerald-600"
                          : "",
                    ].join(" ")}
                  >
                    {(item.actual_quantity - item.system_quantity).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeItem(i)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
          >
            + Add product
          </Button>
        </div>

        <Button onClick={submit} disabled={saving}>
          {saving ? "Saving..." : "Create Adjustment"}
        </Button>
      </div>
    </>
  );
}