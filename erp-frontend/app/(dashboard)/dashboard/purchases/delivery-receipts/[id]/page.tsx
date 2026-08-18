"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ClipboardList, FileText } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { InfoCard } from "@/components/shared/info-card";
import { useParams } from "next/navigation";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDeliveryReceiptRequest } from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import type { DeliveryReceipt, DeliveryReceiptItem } from "@/lib/purchasing-types";

const STATUS_STYLES: Record<string, string> = {
  received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  returned: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default function DeliveryReceiptDetailPage() {
  const { id } = useParams();
  const receiptId = Number(id);
  const { showError } = useFormFeedback();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<DeliveryReceipt | null>(null);

  useEffect(() => {
    setLoading(true);
    getDeliveryReceiptRequest(receiptId)
      .then((data) => setReceipt(data))
      .catch((err) => {
        if (err?.status === 404) return;
        showError(getApiErrorMessage(err, "Failed to load receipt."));
      })
      .finally(() => setLoading(false));
  }, [receiptId, showError]);

  if (loading) return <LoadingSpinner containerClassName="min-h-[60vh]" />;
  if (!receipt) return null;

  return (
    <PermissionGuard permission="purchases.view">
      <PageHeader
        title={`Receipt ${receipt.reference}`}
        description={
          <span className="inline-flex items-center gap-3">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[receipt.status] || ""}`}>
              {receipt.status.replace(/_/g, " ")}
            </span>
            <span className="text-muted-foreground">
              {new Date(receipt.receipt_date).toLocaleDateString()}
            </span>
          </span>
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/purchases/delivery-receipts">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <InfoCard
            label="Reference"
            value={<span className="font-mono">{receipt.reference}</span>}
            icon={<ClipboardList className="size-4" />}
          />
          <InfoCard
            label="Supplier"
            value={<span className="font-mono">{receipt.supplier?.name ?? "—"}</span>}
          />
          <InfoCard
            label="Warehouse"
            value={<span className="font-mono">{receipt.warehouse?.name ?? "—"}</span>}
          />
          {receipt.purchaseOrder && (
            <InfoCard
              label="Purchase Order"
              value={
                <span className="font-mono">
                  {receipt.purchaseOrder.reference}
                </span>
              }
            />
          )}
          {receipt.notes && <InfoCard label="Notes" value={receipt.notes} />}

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              {!receipt.items || receipt.items.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No items recorded.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Ordered</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(receipt.items as DeliveryReceiptItem[]).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm font-mono">
                          {item.product?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {item.ordered_qty}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {item.received_qty}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.unit ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-mono">
                  {receipt.items?.length ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Received Qty</span>
                <span className="font-mono">
                  {(receipt.items ?? []).reduce(
                    (sum, i) => sum + i.received_qty,
                    0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {receipt.status === "draft"
                  ? "This receipt is still a draft."
                  : "Goods have been received into stock. Create a purchase invoice to bill against this receipt."}
              </p>
              {receipt.status === "received" && (
                <Button asChild className="w-full mt-3">
                  <Link href={`/dashboard/purchases/invoices/new?dr=${receipt.id}`}>
                    <FileText className="mr-2 size-4" />
                    Create Invoice
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}