"use client";

import { useEffect, useState } from "react";
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
import { getSuppliersRequest } from "@/lib/api/purchasing";
import { getPurchaseOrdersRequest } from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";
import { createPurchaseInvoiceRequest } from "@/lib/api/purchasing";
import type { PurchaseInvoice, PurchaseOrder } from "@/lib/purchasing-types";

interface LineItem {
  description: string;
  purchase_order_item_id: number | null;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export default function NewInvoicePage() {
  const { showSuccess, showError } = useFormFeedback();
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [poId, setPoId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString(36).toUpperCase()}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", purchase_order_item_id: null, quantity: 0, unit_price: 0, tax_rate: 0 },
  ]);

  useEffect(() => {
    Promise.all([getSuppliersRequest(), getPurchaseOrdersRequest()]).then(([sups, orders]) => {
      setSuppliers(sups.map((s: any) => ({ id: s.id, name: s.name })));
      setPos(orders);
    });
  }, []);

  const relatedPO = poId ? pos.find((p) => String(p.id) === poId) : null;

  function updateLine(idx: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addLine() {
    setItems((prev) => [...prev, { description: "", purchase_order_item_id: null, quantity: 0, unit_price: 0, tax_rate: 0 }]);
  }

  function removeLine(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function calcLineTotal(it: LineItem) {
    const qty = it.quantity || 0;
    const price = it.unit_price || 0;
    const taxRate = (it.tax_rate || 0) / 100;
    return qty * price * (1 + taxRate);
  }

  const grandTotal = items.reduce((sum, it) => sum + calcLineTotal(it), 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId) { showError("Select a supplier."); return; }
    const valid = items.filter((it) => it.description && it.quantity > 0 && it.unit_price > 0);
    if (valid.length === 0) { showError("Add at least one item."); return; }

    setSaving(true);
    try {
      const r = await createPurchaseInvoiceRequest({
        supplier_id: Number(supplierId),
        purchase_order_id: poId ? Number(poId) : undefined,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate || undefined,
        notes: notes || undefined,
        items: valid.map((it) => ({
          description: it.description,
          purchase_order_item_id: it.purchase_order_item_id ?? undefined,
          quantity: it.quantity,
          unit_price: it.unit_price,
          tax_rate: it.tax_rate,
        })),
      });
      showSuccess("Invoice created.");
    } catch (err) {
      showError(getApiErrorMessage(err, "Failed to create invoice."));
      setSaving(false);
    }
  }

  return (
    <PermissionGuard permission="purchases.create">
      <PageHeader
        title="New Purchase Invoice"
        description="Record a new invoice from a supplier."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/purchases/invoices">
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
              <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-1 block text-sm font-medium">Supplier *</span>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">Purchase Order (optional)</span>
                    <Select value={poId} onValueChange={setPoId}>
                      <SelectTrigger><SelectValue placeholder="Link to PO" /></SelectTrigger>
                      <SelectContent>
                        {pos.filter(po => !supplierId || String(po.supplier_id) === supplierId).map((po) => (
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
                    <span className="mb-1 block text-sm font-medium">Invoice # *</span>
                    <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">Invoice Date *</span>
                    <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required />
                  </div>
                  <div>
                    <span className="mb-1 block text-sm font-medium">Due Date</span>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-sm font-medium">Notes</span>
                  <textarea className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Invoice Items</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Description</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Qty</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Unit Price</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Tax %</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Total</th>
                        <th className="px-3 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <Input value={it.description} onChange={(e) => updateLine(idx, { description: e.target.value })} placeholder="Item description" />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" min="0.01" step="0.01" className="w-24 text-right" value={it.quantity || ""} onChange={(e) => updateLine(idx, { quantity: parseFloat(e.target.value) || 0 })} />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" min="0" step="0.01" className="w-28 text-right" value={it.unit_price || ""} onChange={(e) => updateLine(idx, { unit_price: parseFloat(e.target.value) || 0 })} />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" min="0" max="100" step="0.1" className="w-20 text-right" value={it.tax_rate || ""} onChange={(e) => updateLine(idx, { tax_rate: parseFloat(e.target.value) || 0 })} />
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-mono">
                            {calcLineTotal(it).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2">
                            {items.length > 1 && <Button type="button" size="icon" variant="ghost" onClick={() => removeLine(idx)}><Trash2 className="size-4 text-muted-foreground" /></Button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addLine}>
                  <PlusIcon className="mr-1.5 size-3.5" /> Add item
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-mono font-medium">{formatCurrency(grandTotal)}</span>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {saving ? "Creating..." : "Create Invoice"}
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