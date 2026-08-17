"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Filter } from "lucide-react";

import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getStockOverviewRequest } from "@/lib/api/inventory";
import type { StockOverviewRow } from "@/lib/inventory-types";
import { StockStatusBadge } from "./stock-status-badge";

export function StockOverviewContent() {
  const { showError } = useFormFeedback();
  const [rows, setRows] = useState<StockOverviewRow[]>([]);
  const [warehouses, setWarehouses] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStockOverviewRequest()
      .then(({ stock, warehouses: whList }) => {
        setRows(stock);
        setWarehouses(whList ?? []);
      })
      .catch((e) =>
        showError(
          e?.response?.data?.message ?? "Failed to load stock overview."
        )
      )
      .finally(() => setLoading(false));
  }, [showError]);

  const filtered =
    selectedWarehouse
      ? rows.filter((r) => r.warehouse_id === Number(selectedWarehouse))
      : rows;

  return (
    <>
      <PageHeader
        title="Stock Overview"
        description="Current stock levels across warehouses."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/inventory">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select
              value={selectedWarehouse}
              onValueChange={setSelectedWarehouse}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Warehouses</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        {loading ? (
          <LoadingSpinner containerClassName="min-h-40" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No stock data"
            description="Stock information will appear after movements are recorded."
          />
        ) : (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full divide-y">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                      Warehouse
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                      Location
                    </th>
                    <th className="px-4 py-3 text-right text-xs uppercase text-muted-foreground">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs uppercase text-muted-foreground">
                      Min Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-card">
                  {filtered.map((row) => (
                    <tr key={`${row.product_id}-${row.warehouse_id}-${row.location_id ?? "none"}`}>
                      <td className="px-4 py-4 font-mono text-sm">
                        {row.product_sku}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {row.product_name}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {row.warehouse_name}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {row.location_name ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-right text-sm">
                        {Number(row.quantity).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-sm">
                        {Number(row.minimum_stock).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <StockStatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}