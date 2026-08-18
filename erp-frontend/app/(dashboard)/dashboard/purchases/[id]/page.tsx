"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit3, ArrowLeftRight } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { usePermission } from "@/hooks/use-permission";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  getPurchaseOrderRequest,
  markPurchaseOrderAsOrdered,
  cancelPurchaseOrderRequest,
} from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { hasPermission } = usePermission();
  const { showSuccess, showError, showInfo } = useFormFeedback();
  const [po, setPo] = useState<PurchaseOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPurchaseOrderRequest(id);
      setPo(data as PurchaseOrderWithItems);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load purchase order."));
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleMarkOrdered() {
    setActionLoading(true);
    try {
      const r = await markPurchaseOrderAsOrdered(id);
      setPo((p) => p ? { ...p, ...(r as any).purchase_order } : p);
      showSuccess("Purchase order marked as ordered.");
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to mark as ordered."));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    try {
      const r = await cancelPurchaseOrderRequest(id);
      setPo((p) => p ? { ...p, ...(r as any).purchase_order } : p);
      showSuccess("Purchase order cancelled.");
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to cancel order."));
    } finally {
      setActionLoading(false);
      setConfirmCancel(false);
    }
  }

  if (loading) return <LoadingSpinner containerClassName="min-h-[60vh]" />;
  if (!po) return null;

  const canMarkOrdered = hasPermission("purchases.order") && po.status === "draft";
  const canCancel = hasPermission("purchases.cancel") && !["received", "cancelled"].includes(po.status);
  const canReceive = hasPermission("purchases.receive") && ["ordered", "partially_received"].includes(po.status);

  return (
    <PermissionGuard permission="purchases.view">
      <PageHeader
        title={`PO ${po.reference}`}
        description={po.supplier?.name ?? ""}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/purchases">
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
            {canMarkOrdered && (
              <Button onClick={handleMarkOrdered} disabled={actionLoading}>
                Mark Ordered
              </Button>
            )}
            {canReceive && (
              <Button asChild>
                <Link href={`/dashboard/purchases/${po.id}/receive`}>
                  <ArrowLeftRight className="mr-2 size-4" />
                  Receive
                </Link>
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Info label="Reference" value={po.reference} mono />
              <Info label="Status">
                <StatusBadge status={po.status} />
              </Info>
              <Info label="Supplier" value={po.supplier?.name ?? "—"} />
              <Info label="Warehouse" value={po.warehouse?.name ?? "—"} />
              <Info label="Order Date" value={po.order_date ? new Date(po.order_date).toLocaleDateString() : "—"} />
              <Info label="Expected Date" value={po.expected_date ? new Date(po.expected_date).toLocaleDateString() : "—"} />
              <Info label="Created By" value={po.creator?.name ?? "—"} />
            </CardContent>
          </Card>

          {po.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{po.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Product</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Qty</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Received</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Unit Price</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Tax</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {po.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-3 text-sm">
                          <span className="font-medium">{item.product?.name ?? `#${item.product_id}`}</span>
                          {item.product?.sku && <span className="ml-2 font-mono text-xs text-muted-foreground">{item.product.sku}</span>}
                        </td>
                        <td className="px-3 py-3 text-right text-sm">{item.quantity}</td>
                        <td className="px-3 py-3 text-right text-sm">{item.received_quantity}</td>
                        <td className="px-3 py-3 text-right text-sm font-mono">{formatCurrency(item.unit_price)}</td>
                        <td className="px-3 py-3 text-right text-xs text-muted-foreground">{(item.tax_rate || 0)}%</td>
                        <td className="px-3 py-3 text-right text-sm font-mono">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Row label="Subtotal" value={formatCurrency(po.subtotal)} />
              <Row label="Tax" value={formatCurrency(po.tax_amount)} />
              <Row label="Total" value={formatCurrency(po.total)} bold />
            </CardContent>
          </Card>

          {canCancel && (
            <Card>
              <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={() => setConfirmCancel(true)}>
                  Cancel Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel purchase order?"
        description="This action cannot be undone. The order status will be set to cancelled."
        confirmLabel="Cancel Order"
        isLoading={actionLoading}
        onConfirm={handleCancel}
      />
    </PermissionGuard>
  );
}

function Info({ label, value, mono, children }: { label: string; value?: React.ReactNode; mono?: boolean; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{children ?? value}</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${bold ? "text-base font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    ordered: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    partially_received: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[status] || ""}`}>{status.replace(/_/g, " ")}</span>;
}

function formatCurrency(v: number): string {
  return "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PurchaseOrderWithItems {
  id: number;
  company_id: number;
  supplier_id: number;
  warehouse_id: number;
  reference: string;
  order_date: string | null;
  expected_date: string | null;
  status: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  supplier?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string };
  creator?: { id: number; name: string };
  items?: PurchaseOrderItemWithProduct[];
}

interface PurchaseOrderItemWithProduct {
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
  product?: { id: number; name: string; sku: string };
}