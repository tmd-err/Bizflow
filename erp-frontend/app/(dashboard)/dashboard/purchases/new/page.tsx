"use client";

import { useEffect, useState, useCallback } from "react";
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
import { getSuppliersRequest, getWarehousesRequest } from "@/lib/api/purchasing";
import { getProductsRequest } from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/client";
import { createPurchaseOrderRequest } from "@/lib/api/purchasing";

interface LineItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { showError } = useFormFeedback();
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: number; name: string; code: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: number; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string; sku: string }[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [reference, setReference] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ product_id: 0, quantity: 0, unit_price: 0, tax_rate: 0 }]);

  useEffect(() => {
    Promise.all([getSuppliersRequest(), getWarehousesRequest(), getProductsRequest()]).then(([sups, whs, prods]) => {
      setSuppliers(sups.map((s: any) => ({ id: s.id, name: s.name, code: s.code })));
      setWarehouses(whs.map((w: any) => ({ id: w.id, name: w.name })));
      setProducts(prods.map((p: any) => ({ id: p.id, name: p.name, sku: p.sku })));
    }).catch(() => {});
  }, []);

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { product_id: 0, quantity: 0, unit_price: 0, tax_rate: 0 }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function calcLineTotals(it: LineItem) {
    const qty = it.quantity || 0;
    const price = it.unit_price || 0;
    const subtotal = qty * price;
    const taxRate = (it.tax_rate || 0) / 100;
    const tax = subtotal * taxRate;
    return subtotal + tax;
  }

  const grandTotal = items.reduce((sum, it) => sum + calcLineTotals(it), 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId || !warehouseId) {
      showError("Please select a supplier and warehouse.");
      return;
    }
    const validItems = items.filter((it) => it.product_id && it.quantity > 0 && it.unit_price > 0);
    if (validItems.length === 0) {
      showError("Add at least one valid product line.");
      return;
    }

    setSaving(true);
    try {
      const r = await createPurchaseOrderRequest({
        supplier_id: Number(supplierId),
        warehouse_id: Number(warehouseId),
        reference,
        order_date: orderDate || undefined,
        expected_date: expectedDate || undefined,
        notes: notes || undefined,
        items: validItems.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          unit_price: it.unit_price,
          tax_rate: it.tax_rate,
        })),
      });
      router.push(`/dashboard/purchases/${(r as any).purchase_order.id}`);
    } catch (err) {
      showError(getApiErrorMessage(err, "Failed to create purchase order."));
      setSaving(false);
    }
  }

  return (
    <PermissionGuard permission="purchases.create">
      <PageHeader
        title="New Purchase Order"
        description="Create a purchase order from a supplier."
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
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-1 block text-sm font-medium">Supplier *</span>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.code} — {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">Warehouse *</span>
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
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <span className="mb-1 block text-sm font-medium">Reference *</span>
                    <Input value={reference} onChange={(e) => setReference(e.target.value)} required />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">Order Date</span>
                    <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">Expected Date</span>
                    <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
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
                <CardTitle>Product Lines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Product</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Qty</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Unit Price</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Tax %</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Line Total</th>
                        <th className="px-3 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <Select
                              value={it.product_id ? String(it.product_id) : undefined}
                              onValueChange={(v) => updateItem(idx, { product_id: Number(v) })}
                            >
                              <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>
                                    {p.sku} — {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              className="w-24 text-right"
                              value={it.quantity || ""}
                              onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-28 text-right"
                              value={it.unit_price || ""}
                              onChange={(e) => updateItem(idx, { unit_price: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-20 text-right"
                              value={it.tax_rate || ""}
                              onChange={(e) => updateItem(idx, { tax_rate: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-mono">
                            {calcLineTotals(it).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2">
                            {items.length > 1 && (
                              <Button type="button" size="icon" variant="ghost" onClick={() => removeItem(idx)}>
                                <Trash2 className="size-4 text-muted-foreground" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addItem}>
                  <PlusIcon className="mr-1.5 size-3.5" />
                  Add product
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Summary sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-mono font-medium">{formatCurrency(grandTotal)}</span>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {saving ? "Creating..." : "Create Purchase Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </PermissionGuard>
  );
}

function formatCurrency(v: number): string {
  return "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}