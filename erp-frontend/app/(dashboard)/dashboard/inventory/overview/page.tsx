"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, AlertTriangle, PackageX } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PermissionGuard } from "@/components/auth/permission-guard";
import {
  getStockOverviewRequest,
} from "@/lib/api/inventory";
import type { StockOverviewRow } from "@/lib/inventory-types";
import { StockStatusBadge } from "@/components/inventory/stock-status-badge";

export default function InventoryOverviewPage() {
  return (
    <PermissionGuard permission="inventory.view">
      <OverviewContent />
    </PermissionGuard>
  );
}

type Filter = "all" | "low_stock" | "out_of_stock";

function readFilter(sp: ReturnType<typeof useSearchParams>): Filter {
  const v = sp.get("status");
  if (v === "low_stock" || v === "out_of_stock") return v;
  return "all";
}

function OverviewContent() {
  const searchParams = useSearchParams();
  const filter = readFilter(searchParams);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          filter === "low_stock"
            ? "Low Stock Products"
            : filter === "out_of_stock"
              ? "Out of Stock Products"
              : "Inventory Overview"
        }
        description={
          filter === "low_stock"
            ? "Products whose current stock is at or below the minimum threshold."
            : filter === "out_of_stock"
              ? "Products with no remaining stock in any warehouse."
              : "Current stock levels across warehouses."
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/inventory">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <StatusTabs filter={filter} />

      <StockList filter={filter} />
    </div>
  );
}

const TABS: { href: string; label: string; icon?: React.ReactNode }[] = [
  { href: "/dashboard/inventory/overview?status=all", label: "All Stock" },
  {
    href: "/dashboard/inventory/overview?status=low_stock",
    label: "Low Stock",
    icon: <AlertTriangle className="size-4 text-amber-500" />,
  },
  {
    href: "/dashboard/inventory/overview?status=out_of_stock",
    label: "Out of Stock",
    icon: <PackageX className="size-4 text-red-500" />,
  },
];

function StatusTabs({ filter }: { filter: Filter }) {
  return (
    <div className="flex gap-2">
      {TABS.map((t) => {
        const status = (t.href.match(/status=(\w+)/)?.[1] ?? "all") as Filter;
        return (
          <Button key={t.href} asChild variant={filter === status ? "default" : "outline"} size="sm">
            <Link href={t.href} className="inline-flex items-center gap-1.5">
              {t.icon}
              {t.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

function StockList({ filter }: { filter: Filter }) {
  const [rows, setRows] = useState<StockOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStockOverviewRequest()
      .then(({ stock }) => setRows(stock))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  if (loading) {
    return <LoadingSpinner containerClassName="min-h-40" />;
  }

  if (filtered.length === 0) {
    const emptyMsg =
      filter === "low_stock"
        ? "No low stock products."
        : filter === "out_of_stock"
          ? "All products have stock."
          : "No stock data available.";

    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">{emptyMsg}</p>
        </CardContent>
      </Card>
    );
  }

  return (
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
                <td className="px-4 py-4 font-mono text-sm">{row.product_sku}</td>
                <td className="px-4 py-4 text-sm font-medium">{row.product_name}</td>
                <td className="px-4 py-4 text-sm">{row.warehouse_name}</td>
                <td className="px-4 py-4 text-sm">{row.location_name ?? "—"}</td>
                <td className="px-4 py-4 text-right text-sm">{Number(row.quantity).toLocaleString()}</td>
                <td className="px-4 py-4 text-right text-sm">{Number(row.minimum_stock).toLocaleString()}</td>
                <td className="px-4 py-4">
                  <StockStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}