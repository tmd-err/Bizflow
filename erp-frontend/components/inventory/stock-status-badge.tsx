"use client";

import { cn } from "@/lib/utils";
import type { StockOverviewRow } from "@/lib/inventory-types";

interface StatusBadgeProps {
  status: StockOverviewRow["status"];
}

export function StockStatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    in_stock: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    low_stock: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    out_of_stock: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };

  const labels: Record<string, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        styles[status] ?? styles.in_stock
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}