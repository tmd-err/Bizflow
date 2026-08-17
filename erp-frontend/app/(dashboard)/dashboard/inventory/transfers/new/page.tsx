"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  createTransferRequest,
  getWarehousesRequest,
  getStockOverviewRequest,
} from "@/lib/api/inventory";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Warehouse, StockOverviewRow } from "@/lib/inventory-types";

export default function NewTransferPage() {
  const { showSuccess, showError } = useFormFeedback();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [reference, setReference] = useState("");
  const [stock, setStock] = useState<StockOverviewRow[]>([]);

  const [items, setItems] = useState<
    Array<{ product_id: number; quantity: number }>
  >([]);

  useEffect(() => {
    Promise.all([getWarehousesRequest(), getStockOverviewRequest()])
      .then(([wh, { stock: s }]) => {
        setWarehouses(wh);
        setStock(s);
      })
      .catch((e) =>
        showError(
          e?.response?.data?.message ?? "Failed to load data."
        )
      )
      .finally(() => setLoading(false));
  }, [showError]);

  const fromStock = fromId
    ? stock.filter((s) => s.warehouse_id === Number(fromId))
    : [];

  function addItem() {
    setItems([...items, { product_id: 0, quantity: 0 }]);
  }

  function updateItem(
    index: number,
    patch: Partial<{ product_id: number; quantity: number }>
  ) {
    setItems(
      items.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function submit() {
    if (!fromId || !toId || !reference || items.length === 0) {
      showError("Please fill in all required fields.");
      return;
    }
    if (fromId === toId) {
      showError("Source and destination must differ.");
      return;
    }

    const valid = items.every(
      (i) => i.product_id > 0 && i.quantity > 0
    );
    if (!valid) {
      showError("Each item must have a product and a quantity > 0.");
      return;
    }

    setSaving(true);
    try {
      await createTransferRequest({
        from_warehouse_id: Number(fromId),
        to_warehouse_id: Number(toId),
        reference,
        items,
      });
      showSuccess("Transfer created.");
      window.location.href = "/dashboard/inventory/transfers";
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to create transfer."));
      setSaving(false);
    }
  }

  if (loading)
    return <LoadingSpinner containerClassName="min-h-[60vh]" />;

  return (
    <PermissionGuard permission="inventory.transfer">
      <PageHeader
        title="New Stock Transfer"
        description="Move stock between warehouses."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/inventory/transfers">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label className="mb-1.5 block text-sm font-medium">
              From *
            </Label>
            <select
              className="w-full rounded-lg border bg-input px-3 py-2 text-sm text-foreground [&>option]:bg-popover [&>option]:text-popover-foreground"
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value);
                setItems([]);
              }}
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
            <Label className="mb-1.5 block text-sm font-medium">
              To *
            </Label>
            <select
              className="w-full rounded-lg border bg-input px-3 py-2 text-sm text-foreground [&>option]:bg-popover [&>option]:text-popover-foreground"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
            >
              <option value="">Select warehouse</option>
              {warehouses
                .filter((w) => String(w.id) !== fromId)
                .map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-medium">
              Reference *
            </Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. TRF-001"
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
                  Qty
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
                      {fromStock.map((s) => (
                        <option key={s.product_id} value={s.product_id}>
                          {s.product_sku} — {s.product_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Input
                      type="number"
                      step="0.001"
                      className="w-28 text-right"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        updateItem(i, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
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
            <Plus className="mr-2 size-4" />
            Add product
          </Button>
        </div>

        <Button onClick={submit} disabled={saving}>
          {saving ? "Creating..." : "Create Transfer"}
        </Button>
      </div>
    </PermissionGuard>
  );
}