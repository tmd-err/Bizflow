"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  getDeliveryReceiptsRequest,
} from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";
import { ArrowLeft, Plus, ClipboardList } from "lucide-react";
import type { DeliveryReceipt } from "@/lib/purchasing-types";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  returned: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function DeliveryReceiptsListContent() {
  const { showError } = useFormFeedback();
  const [receipts, setReceipts] = useState<DeliveryReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDeliveryReceiptsRequest();
      setReceipts(data);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load delivery receipts."));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = receipts.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.reference.toLowerCase().includes(q) ||
      r.supplier?.name?.toLowerCase().includes(q) ||
      r.warehouse?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <PermissionGuard permission="purchases.view">
      <PageHeader
        title="Delivery Receipts"
        description="Track goods received from suppliers before invoicing."
        actions={
          <Button asChild>
            <Link href="/dashboard/purchases/delivery-receipts/new">
              <Plus className="mr-2 size-4" />
              New Receipt
            </Link>
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Search by reference, supplier or warehouse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <LoadingSpinner containerClassName="min-h-[60vh]" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={receipts.length === 0 ? "No delivery receipts" : "No matching receipts"}
          description={
            receipts.length === 0
              ? "Record goods receipt from your suppliers."
              : "Try changing your search criteria."
          }
          action={
            receipts.length === 0 ? (
              <Button asChild>
                <Link href="/dashboard/purchases/delivery-receipts/new">
                  <Plus className="mr-2 size-4" />
                  New Receipt
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.reference}</TableCell>
                  <TableCell className="text-sm">{r.supplier?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{r.warehouse?.name ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(r.receipt_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">{r.items_count ?? (r.items?.length ?? 0)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status] || ""}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/purchases/delivery-receipts/${r.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PermissionGuard>
  );
}