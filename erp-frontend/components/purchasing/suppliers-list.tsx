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
import { usePermission } from "@/hooks/use-permission";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  getSuppliersRequest,
} from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";
import { ArrowLeft, Building2 } from "lucide-react";

export function SuppliersListContent() {
  const { hasPermission } = usePermission();
  const { showError } = useFormFeedback();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSuppliersRequest();
      setSuppliers(data);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load suppliers."));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PermissionGuard permission="suppliers.view">
      <PageHeader
        title="Suppliers"
        description="Manage your suppliers and vendors."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/purchases">
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
            {hasPermission("suppliers.create") ? (
              <Button asChild>
                <Link href="/dashboard/purchases/suppliers/new">New Supplier</Link>
              </Button>
            ) : null}
          </>
        }
      />

      {loading ? (
        <LoadingSpinner containerClassName="min-h-[60vh]" />
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No suppliers yet"
          description="Add your first supplier to start managing purchases."
          action={
            hasPermission("suppliers.create") ? (
              <Button asChild>
                <Link href="/dashboard/purchases/suppliers/new">New Supplier</Link>
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
                <TableHead>Email</TableHead>
                <TableHead>Tax ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.code}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.city ?? "—"}</TableCell>
                  <TableCell className="text-sm">{s.email ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.tax_number ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/purchases/suppliers/${s.id}`}>Manage</Link>
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