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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/use-permission";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  getPurchaseInvoicesRequest,
} from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";
import { ArrowLeft, Plus, FileText } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  unpaid: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  partially_paid: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function InvoicesListContent() {
  const { hasPermission } = usePermission();
  const { showError } = useFormFeedback();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPurchaseInvoicesRequest();
      setInvoices(data);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load invoices."));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = invoices.filter((inv) => {
    if (statusFilter && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.supplier?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PermissionGuard permission="purchases.view">
      <PageHeader
        title="Purchase Invoices"
        description="Manage supplier invoices and payments."
        actions={
          <Button asChild>
            <Link href="/dashboard/purchases/invoices/new">
              <Plus className="mr-2 size-4" />
              New Invoice
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search invoice or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner containerClassName="min-h-[60vh]" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={invoices.length === 0 ? "No invoices yet" : "No matching invoices"}
          description={
            invoices.length === 0
              ? "Create your first invoice to track supplier billing."
              : "Try changing your search or filter criteria."
          }
          action={
            invoices.length === 0 && hasPermission("purchases.create") ? (
              <Button asChild>
                <Link href="/dashboard/purchases/invoices/new">
                  <Plus className="mr-2 size-4" />
                  New Invoice
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
                <TableHead>Invoice #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                  <TableCell className="text-sm">{inv.supplier?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(inv.invoice_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">
                    {formatCurrency(inv.total)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">
                    {formatCurrency(inv.paid_amount)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[inv.status] || ""}`}>
                      {inv.status.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/purchases/invoices/${inv.id}`}>
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

function formatCurrency(v: number): string {
  return "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}