"use client";

import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getTransfersRequest, completeTransferRequest } from "@/lib/api/inventory";
import { getApiErrorMessage } from "@/lib/api/client";
import type { StockTransfer } from "@/lib/inventory-types";

const statusIcon: Record<string, React.ReactNode> = {
  draft: <Clock className="size-4 text-muted-foreground" />,
  pending: <AlertTriangle className="size-4 text-amber-500" />,
  completed: <CheckCircle2 className="size-4 text-emerald-500" />,
};

export function TransfersListContent() {
  const { showSuccess, showError } = useFormFeedback();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTransfersRequest();
      setTransfers(data);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load transfers."));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function complete(transfer: StockTransfer) {
    if (transfer.status === "completed") return;
    setCompletingId(transfer.id);
    try {
      await completeTransferRequest(transfer.id);
      showSuccess("Transfer completed.");
      await load();
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to complete transfer."));
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <PermissionGuard permission="inventory.transfer">
      <PageHeader
        title="Stock Transfers"
        description="Transfer stock between warehouses."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/inventory">
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
            <Button asChild>
              <a href="/dashboard/inventory/transfers/new">
                <ArrowLeftRight className="mr-2 size-4" />
                New Transfer
              </a>
            </Button>
          </>
        }
      />

      {loading ? (
        <LoadingSpinner containerClassName="min-h-40" />
      ) : transfers.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border bg-muted/10 text-center">
          <ArrowLeftRight className="size-10 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">No transfers recorded</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Create a transfer to move stock between warehouses.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/inventory/transfers/new">
              <ArrowLeftRight className="mr-2 size-4" /> New Transfer
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-sm">{t.reference}</TableCell>
                  <TableCell className="text-sm">{t.fromWarehouse?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{t.toWarehouse?.name ?? "—"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      {statusIcon[t.status] ?? <Clock className="size-3.5" />}
                      {t.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{t.items?.length ?? 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {t.status !== "completed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={completingId === t.id}
                        onClick={() => complete(t)}
                      >
                        {completingId === t.id ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1.5 size-3.5" />
                        )}
                        Complete
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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