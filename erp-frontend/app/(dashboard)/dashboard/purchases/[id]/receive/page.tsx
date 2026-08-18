"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  getPurchaseOrderRequest,
  receivePurchaseOrderRequest,
} from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";

export default function ReceivePurchaseOrderPage() {
  const params = useParams();
  const id = Number(params.id);
  const { showSuccess, showError } = useFormFeedback();
  const [po, setPo] = useState<ReceivePO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPurchaseOrderRequest(id);
      setPo(data as ReceivePO);
      const init: Record<number, string> = {};
      (data as any).items?.forEach((item: any) => {
        const remaining = item.quantity - item.received_quantity;
        init[item.id] = String(remaining);
      });
      setQuantities(init);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load purchase order."));
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit() {
    if (!po) return;
    const items = po.items
      .map((it) => ({
        purchase_order_item_id: it.id,
        quantity: Math.max(0, parseFloat(quantities[it.id] || "0") || 0),
      }))
      .filter((it) => it.quantity > 0);

    if (items.length === 0) {
      showError("Enter quantities to receive.");
      return;
    }

    setSubmitting(true);
    try {
      const r = await receivePurchaseOrderRequest(id, items);
      setPo((p) => p ? { ...p, status: (r as any).status } : p);
      showSuccess("Goods received successfully. Inventory has been updated.");
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to receive goods."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner containerClassName="min-h-[60vh]" />;
  if (!po) return null;

  const canReceive = ["ordered", "partially_received"].includes(po.status);

  return (
    <PermissionGuard permission="purchases.receive">
      <PageHeader
        title="Receive Goods"
        description={`PO ${po.reference} — ${po.supplier?.name ?? ""}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/dashboard/purchases/${po.id}`}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />

      {!canReceive ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              This order (status: {po.status}) cannot be received.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <InfoCard label="Warehouse" value={po.warehouse?.name ?? "—"} />
            <InfoCard label="Supplier" value={po.supplier?.name ?? "—"} />
            <InfoCard label="PO Reference" value={po.reference} mono />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Items to Receive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Enter the quantity received for each product. You cannot exceed the remaining ordered quantity.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Product</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Ordered</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Received</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Remaining</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Receive Now</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {po.items?.map((item) => {
                      const remaining = item.quantity - item.received_quantity;
                      return (
                        <tr key={item.id}>
                          <td className="px-3 py-3 text-sm">
                            <span className="font-medium">{item.product?.name ?? `#${item.product_id}`}</span>
                          </td>
                          <td className="px-3 py-3 text-right text-sm">{item.quantity}</td>
                          <td className="px-3 py-3 text-right text-sm">{item.received_quantity}</td>
                          <td className="px-3 py-3 text-right text-sm font-mono">{remaining}</td>
                          <td className="px-3 py-3">
                            <Input
                              type="number"
                              min="0"
                              max={remaining}
                              step="0.01"
                              className="w-28 text-right"
                              value={quantities[item.id] || ""}
                              onChange={(e) => setQuantities((q) => ({ ...q, [item.id]: e.target.value }))}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button onClick={submit} disabled={submitting} size="lg">
              {submitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 size-4" />
              )}
              {submitting ? "Processing..." : "Confirm Receipt"}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Stock movements will be created and inventory will be updated upon confirmation.
            </p>
          </div>
        </>
      )}
    </PermissionGuard>
  );
}

function InfoCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className={`mt-1 text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

interface ReceiveItem {
  id: number;
  product_id: number;
  quantity: number;
  received_quantity: number;
  product?: { id: number; name: string; sku: string };
}

interface ReceivePO {
  id: number;
  reference: string;
  status: string;
  supplier?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string };
  items: ReceiveItem[];
}