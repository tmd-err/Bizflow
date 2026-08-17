"use client";

import { type StockAdjustment } from "@/lib/inventory-types";

interface Props {
  initialData: (StockAdjustment & { items: any[] })[];
  onCreateNew: () => void;
}

export function AdjustmentsTable({ initialData, onCreateNew }: Props) {
  if (initialData.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border bg-muted/20 text-center">
        <p className="text-sm font-medium">No adjustments yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create your first adjustment to correct stock levels.
        </p>
        <button
          onClick={onCreateNew}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Adjustment
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="min-w-full divide-y">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
              Reference
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
              Warehouse
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
              Reason
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
              Items
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
              By
            </th>
          </tr>
        </thead>
        <tbody className="divide-y bg-card">
          {initialData.map((adj) => (
            <tr key={adj.id}>
              <td className="px-4 py-4 font-mono text-sm">
                {adj.reference}
              </td>
              <td className="px-4 py-4 text-sm">
                {adj.warehouse?.name ?? "—"}
              </td>
              <td className="px-4 py-4 text-sm text-muted-foreground">
                {adj.reason ?? "—"}
              </td>
              <td className="px-4 py-4 text-sm">
                {adj.items?.length ?? 0} item(s)
              </td>
              <td className="px-4 py-4 text-sm whitespace-nowrap">
                {adj.created_at
                  ? new Date(adj.created_at).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-4 py-4 text-sm text-muted-foreground">
                {adj.createdBy?.name ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}