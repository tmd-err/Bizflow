"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus as PlusIcon, Trash2 } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  getSuppliersRequest,
  getPurchaseOrdersRequest,
  getWarehousesRequest,
} from "@/lib/api/purchasing";
import {
  getApiErrorMessage,
  apiPost,
} from "@/lib/api/client";
import type { PurchaseOrder, Warehouse } from "@/lib/purchasing-types";

interface LineItem {
  purchase_order_item_id: number | null;
  product_id: number | null;
  description: string;
  ordered_qty: number;
  received_qty: number;
  unit: string;
}

export default function NewDeliveryReceiptPage() {
  const router = useRouter();
  const { showSuccess, showError } = useFormFeedback();
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [poId, setPoId] = useState("");
  const [reference, setReference] = useState(`DR-${Date.now().toString(36).toUpperCase()}`);
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10));
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { purchase_order_item_id: null, product_id: null, description: "", ordered_qty: 0, received_qty: 0, unit: "" },
  ]);

  useEffect(() => {
    Promise.all([
      getSuppliersRequest(),
      getPurchaseOrdersRequest(),
      getWarehousesRequest(),
    ]).then(([sups, orders, whs]) => {
      setSuppliers(sups.map((s: any) => ({ id: s.id, name: s.name })));
      setPos(orders as PurchaseOrder[]);
      setWarehouses(whs);
    });
  }, []);

  const filteredPOs = !poId
    ? pos.filter(
        (p) => !supplierId || String(p.supplier_id) === supplierId
      )
    : pos;

  const selectedPO = poId
    ? pos.find((p) => String(p.id) === poId)
    : null;

  useEffect(() => {
    if (selectedPO && !warehouseId && selectedPO.warehouse_id) {
      setWarehouseId(String(selectedPO.warehouse_id));
    }
  }, [selectedPO, warehouseId]);

  useEffect(() => {
    if (selectedPO?.items) {
      setItems(
        selectedPO.items.map((it) => ({
          purchase_order_item_id: it.id,
          product_id: it.product_id ?? null,
          description: it.product?.name ?? "",
          ordered_qty: it.quantity,
          received_qty: 0,
          unit: "", // extend product data later if needed
        }))
      );
    }
  }, [poId]);

  function updateLine(idx: number, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  }

  function addLine() {
    setItems((prev) => [
      ...prev,
      { purchase_order_item_id: null, product_id: null, description: "", ordered_qty: 0, received_qty: 0, unit: "" },
    ]);
  }

  function removeLine(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!warehouseId) {
      showError("Select a receiving warehouse.");
      return;
    }
    const valid = items.filter(
      (it) => it.purchase_order_item_id && it.received_qty > 0
    );
    if (valid.length === 0) {
      showError("Add at least one item with a received quantity.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        warehouse_id: Number(warehouseId),
        receipt_date: receiptDate,
        reference,
        notes: notes || undefined,
        items: valid.map((it) => ({
          purchase_order_item_id: it.purchase_order_item_id ?? undefined,
          product_id: it.product_id ?? undefined,
          received_qty: it.received_qty,
          description: it.description || undefined,
          ordered_qty: it.ordered_qty || undefined,
          unit: it.unit || undefined,
        })),
      };
      if (poId) {
        payload.purchase_order_id = Number(poId);
      } else if (supplierId) {
        payload.supplier_id = Number(supplierId);
      }

      const r = await apiPost<{ message: string; delivery_receipt: any }>("/api/delivery-receipts", payload);
      showSuccess("Delivery receipt created.");
      router.push(`/dashboard/purchases/delivery-receipts/${(r as any).delivery_receipt.id}`);
    } catch (err) {
      showError(getApiErrorMessage(err, "Failed to create delivery receipt."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PermissionGuard permission="purchases.create">
      <PageHeader
        title="New Delivery Receipt"
        description="Record goods received from a supplier (proforma before invoicing)."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/purchases">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />
      <form onSubmit={submit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Receipt Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-1 block text-sm font-medium">
                      Supplier *
                    </span>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">
                      Purchase Order (optional)
                    </span>
                    <Select value={poId} onValueChange={setPoId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Link to PO" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPOs.map((po) => (
                          <SelectItem key={po.id} value={String(po.id)}>
                            {po.reference}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <span className="mb-1 block text-sm font-medium">
                      Reference #
                    </span>
                    <Input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">
                      Receipt Date *
                    </span>
                    <Input
                      type="date"
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">
                      Warehouse *
                    </span>
                    <Select value={warehouseId} onValueChange={setWarehouseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={String(w.id)}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-sm font-medium">Notes</span>
                  <textarea
                    className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Received Items</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPO?.items && (
                  <p className="mb-3 text-xs text-muted-foreground">
                    Items sourced from{" "}
                    <span className="font-mono">{selectedPO.reference}</span> —
                    define quantities received.
                  </p>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">
                          Item
                        </th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">
                          Ordered
                        </th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">
                          Unit
                        </th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">
                          Qty Received *
                        </th>
                        <th className="px-3 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-sm">
                            {it.description || "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            {it.ordered_qty}
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            {it.unit || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              className="w-24 text-right"
                              value={it.received_qty || ""}
                              onChange={(e) =>
                                updateLine(idx, {
                                  received_qty: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            {items.length > 1 && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeLine(idx)}
                              >
                                <Trash2 className="size-4 text-muted-foreground" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!selectedPO && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={addLine}
                  >
                    <PlusIcon className="mr-1.5 size-3.5" /> Add item
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Items
                  </span>
                  <span className="font-mono">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Qty Received</span>
                  <span className="font-mono">
                    {items.reduce((s, i) => s + i.received_qty, 0)}
                  </span>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : null}
                  {saving ? "Creating..." : "Create Receipt"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </PermissionGuard>
  );
}