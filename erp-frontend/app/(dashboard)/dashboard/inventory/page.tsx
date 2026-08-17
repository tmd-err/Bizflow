"use client";

import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { InventoryDashboardContent } from "@/components/inventory/inventory-dashboard";

export default function InventoryPage() {
  const { showError } = useFormFeedback();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Stock overview, movements, adjustments, and transfers."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <NavLink
          href="/dashboard/inventory/stock"
          label="Stock Overview"
          description="Current stock levels by product and warehouse."
          icon={
            <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
            </svg>
          }
        />
        <NavLink
          href="/dashboard/inventory/movements"
          label="Stock Movements"
          description="History of all incoming and outgoing movements."
          icon={
            <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          }
        />
        <NavLink
          href="/dashboard/inventory/adjustments"
          label="Adjustments"
          description="Create and review stock adjustments."
          icon={
            <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v8" />
              <path d="M8 12l4-4 4 4" />
            </svg>
          }
        />
        <NavLink
          href="/dashboard/inventory/transfers"
          label="Transfers"
          description="Move stock between warehouses."
          icon={
            <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16l-4-4 4-4" />
              <path d="M17 8l4 4-4 4" />
              <path d="M3 12h18" />
            </svg>
          }
        />
        <NavLink
          href="/dashboard/inventory/warehouses"
          label="Warehouses"
          description="Manage warehouses and their locations."
          icon={
            <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-4" />
            </svg>
          }
        />
      </div>

      <div className="mt-6">
        <InventoryDashboardContent />
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/60"
    >
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}