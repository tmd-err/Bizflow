"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  getStockMovementsRequest,
} from "@/lib/api/inventory";
import { getApiErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function MovementsPage() {
  const { showError, showSuccess } = useFormFeedback();
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQ(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  function loadMovements() {
    setLoading(true);
    getStockMovementsRequest({
      type: typeFilter || undefined,
      warehouse_id: warehouseFilter ? Number(warehouseFilter) : undefined,
      from_date: dateFrom || undefined,
      to_date: dateTo || undefined,
    })
      .then((data) => setMovements(data))
      .catch((e) =>
        showError(
          e?.response?.data?.message ?? "Failed to load movements."
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMovements();
  }, [q, typeFilter, warehouseFilter, dateFrom, dateTo]);

  // extract unique types for the dropdown
  const typeOptions = useMemo(() => {
    const s = new Set(movements.map((m) => m.type));
    return Array.from(s).sort();
  }, [movements]);

  // client-side text search
  const filtered = useMemo(() => {
    if (!q.trim()) return movements;
    const lq = q.toLowerCase();
    return movements.filter((m) => {
      const name = m.product?.name ?? "";
      const sku = m.product?.sku ?? "";
      return (
        name.toLowerCase().includes(lq) ||
        sku.toLowerCase().includes(lq)
      );
    });
  }, [movements, q]);

  return (
    <PermissionGuard permission="inventory.view">
      <PageHeader
        title="Stock Movements"
        description="History of all incoming and outgoing movements."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/inventory">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />

      {/* filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="h-9 w-64 rounded-lg border bg-transparent px-3 py-1 text-sm"
          placeholder="Search product or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-9 rounded-lg border bg-input px-3 py-1 text-sm text-foreground [&>option]:bg-popover [&>option]:text-popover-foreground"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          {typeOptions.map((t: string) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="h-9 rounded-lg border bg-transparent px-3 py-1 text-sm"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="h-9 rounded-lg border bg-transparent px-3 py-1 text-sm"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {/* table */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No movements found.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="min-w-full divide-y">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-xs uppercase text-muted-foreground">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleString()
                      : ""}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {m.product?.name ?? "—"}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {m.product?.sku ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{m.type}</td>
                  <td
                    className={`px-4 py-3 text-right text-sm font-mono ${
                      Number(m.quantity) < 0
                        ? "text-red-600"
                        : Number(m.quantity) > 0
                          ? "text-emerald-600"
                          : ""
                    }`}
                  >
                    {Number(m.quantity).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {m.notes ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PermissionGuard>
  );
}