"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowRight, AlertTriangle, PackageX, TrendingUp } from "lucide-react";
import Link from "next/link";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  getInventoryDashboardRequest,
  type InventoryDashboardStats,
} from "@/lib/api/inventory";

function formatNumber(n: number): string {
  return Number(n).toLocaleString();
}

/* ── Simple in-memory cache for dashboard data (persists across
      component unmount/mount so we don't re-fetch on every navigation) ── */
interface CachedData {
  stats: InventoryDashboardStats;
  lowStock: Array<{ id: number; name: string; sku: string }>;
  outOfStock: Array<{ id: number; name: string; sku: string }>;
  timestamp: number;
}
const CACHE_TTL_MS = 30_000; // 30 seconds freshness window
let _cached: CachedData | null = null;

export function InventoryDashboardContent() {
  const { showError } = useFormFeedback();
  const [stats, setStats] = useState<InventoryDashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<
    Array<{ id: number; name: string; sku: string }>
  >([]);
  const [outOfStock, setOutOfStock] = useState<
    Array<{ id: number; name: string; sku: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(
    async (force = false) => {
      if (!force && _cached && Date.now() - _cached.timestamp < CACHE_TTL_MS) {
        setStats(_cached!.stats);
        setLowStock(_cached!.lowStock);
        setOutOfStock(_cached!.outOfStock);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getInventoryDashboardRequest();
        _cached = {
          stats: data.stats,
          lowStock: data.low_stock ?? [],
          outOfStock: data.out_of_stock ?? [],
          timestamp: Date.now(),
        };
        setStats(data.stats);
        setLowStock(data.low_stock ?? []);
        setOutOfStock(data.out_of_stock ?? []);
      } catch (e) {
        showError(
          e?.response?.data?.message ?? "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingSpinner containerClassName="min-h-[60vh]" />;
  }

  const statCards = [
    {
      label: "Products with Stock",
      value: formatNumber(stats?.total_products_with_stock ?? 0),
      icon: TrendingUp,
    },
    {
      label: "Total Stock Qty",
      value: formatNumber(stats?.total_stock_quantity ?? 0),
      icon: PackageX,
    },
    {
      label: "Low Stock Products",
      value: formatNumber(stats?.low_stock_count ?? 0),
      icon: AlertTriangle,
      href: "/dashboard/inventory/overview?status=low_stock",
    },
    {
      label: "Out of Stock",
      value: formatNumber(stats?.out_of_stock_count ?? 0),
      icon: PackageX,
      href: "/dashboard/inventory/overview?status=out_of_stock",
    },
  ];

  return (
    <PermissionGuard permission="inventory.view">
      <PageHeader
        title="Inventory"
        description="Stock overview, movements, adjustments, and transfers."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <s.icon className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {s.label}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{s.value}</p>
              {s.href ? (
                <Link
                  href={s.href}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View details <ArrowRight className="size-3.5" />
                </Link>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>

      {lowStock.length > 0 || outOfStock.length > 0 ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-amber-500" />
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">No low stock products.</p>
              ) : (
                <ul className="space-y-2">
                  {lowStock.slice(0, 10).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {p.sku}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageX className="size-4 text-red-500" />
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outOfStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">All products have stock.</p>
              ) : (
                <ul className="space-y-2">
                  {outOfStock.slice(0, 10).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {p.sku}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </PermissionGuard>
  );
}