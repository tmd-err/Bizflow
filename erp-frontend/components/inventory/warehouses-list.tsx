"use client";

import { useEffect, useState, useCallback } from "react";

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
import { usePermission } from "@/hooks/use-permission";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getWarehousesRequest } from "@/lib/api/inventory";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Warehouse } from "@/lib/inventory-types";
import { ArrowLeft, Warehouse as WarehouseIcon } from "lucide-react";
import Link from "next/link";

export function WarehousesListContent() {
  const { hasPermission } = usePermission();
  const { showError } = useFormFeedback();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWarehousesRequest();
      setWarehouses(data);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load warehouses."));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingSpinner containerClassName="min-h-[60vh]" />;

  return (
    <>
      <PageHeader
        title="Warehouses"
        description="Manage your warehouses and storage locations."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/inventory">
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
            {hasPermission("warehouses.create") ? (
              <Button asChild>
                <a href="/dashboard/inventory/warehouses/new">Add warehouse</a>
              </Button>
            ) : null}
          </>
        }
      />

      {warehouses.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title="No warehouses yet"
          description="Create your first warehouse to start managing inventory."
          action={
            hasPermission("warehouses.create") ? (
              <Button asChild>
                <a href="/dashboard/inventory/warehouses/new">Add warehouse</a>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-mono text-sm">{w.code}</TableCell>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{w.city ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        w.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {w.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <a href={`/dashboard/inventory/warehouses/${w.id}`}>Manage</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}