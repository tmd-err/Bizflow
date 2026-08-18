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
  getPurchaseOrdersRequest,
} from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  ArrowLeft,
  Plus,
  FileText,
  Trash2,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "ordered", label: "Ordered" },
  { value: "partially_received", label: "Partially Received" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  ordered: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  partially_received:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  received:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function PurchaseOrdersListContent() {
  const { hasPermission } = usePermission();
  const { showError } = useFormFeedback();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPurchaseOrdersRequest();
      setOrders(data);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load purchase orders."));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = orders.filter((po) => {
    if (statusFilter && po.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        po.reference.toLowerCase().includes(q) ||
        po.supplier?.name?.toLowerCase().includes(q) ||
        po.supplier?.code?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PermissionGuard permission="purchases.view">
      <PageHeader
        title="Purchase Orders"
        description="Manage purchases from suppliers."
        actions={
          <Button asChild>
            <Link href="/dashboard/purchases/new">
              <Plus className="mr-2 size-4" />
              New Purchase Order
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search reference or supplier..."
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
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner containerClassName="min-h-[60vh]" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            orders.length === 0
              ? "No purchase orders yet"
              : "No matching orders"
          }
          description={
            orders.length === 0
              ? "Create your first purchase order to start purchasing from suppliers."
              : "Try changing your search or filter criteria."
          }
          action={
            orders.length === 0 && hasPermission("purchases.create") ? (
              <Button asChild>
                <Link href="/dashboard/purchases/new">
                  <Plus className="mr-2 size-4" />
                  New Purchase Order
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
                <TableHead>Reference</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono text-sm">{po.reference}</TableCell>
                  <TableCell className="text-sm">
                    {po.supplier?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {po.warehouse?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {po.order_date
                      ? new Date(po.order_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {po.expected_date
                      ? new Date(po.expected_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">
                    {formatCurrency(po.total)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[po.status] || ""}`}
                    >
                      {formatStatus(po.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/purchases/${po.id}`}>
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

function formatStatus(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}