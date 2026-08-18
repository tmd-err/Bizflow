"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { usePermission } from "@/hooks/use-permission";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  getSupplierRequest,
  deactivateSupplierRequest,
  reactivateSupplierRequest,
} from "@/lib/api/purchasing";
import { getApiErrorMessage } from "@/lib/api/client";

export default function SupplierDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { hasPermission } = usePermission();
  const { showSuccess, showError } = useFormFeedback();
  const [supplier, setSupplier] = useState<SupplierWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSupplierRequest(id);
      setSupplier(data as SupplierWithRelations);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to load supplier."));
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDeactivate() {
    setDeleting(true);
    try {
      await deactivateSupplierRequest(id);
      showSuccess("Supplier deactivated.");
      setSupplier((s) => s ? { ...s, is_active: false } : s);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to deactivate supplier."));
    } finally {
      setDeleting(false);
      setConfirmDeactivate(false);
    }
  }

  async function handleReactivate() {
    setDeleting(true);
    try {
      const r = await reactivateSupplierRequest(id);
      setSupplier((s) => s ? { ...s, is_active: true } : s);
      showSuccess("Supplier reactivated.");
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to reactivate supplier."));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <LoadingSpinner containerClassName="min-h-[60vh]" />;
  }

  if (!supplier) {
    return (
      <PermissionGuard permission="suppliers.view">
        <PageHeader title="Supplier Not Found" />
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="suppliers.view">
      <PageHeader
        title={supplier.name}
        description={`Supplier code: ${supplier.code}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/purchases/suppliers">
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
            {hasPermission("suppliers.update") ? (
              <Button asChild>
                <Link href={`/dashboard/purchases/suppliers/${supplier.id}/edit`}>
                  <Edit3 className="mr-2 size-4" />
                  Edit
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Info label="Code" value={supplier.code} mono />
              <Info label="Name" value={supplier.name} />
              <Info label="Email" value={supplier.email ?? "—"} />
              <Info label="Phone" value={supplier.phone ?? "—"} />
              <Info label="City" value={supplier.city ?? "—"} />
              <Info label="Country" value={supplier.country ?? "—"} />
              <Info label="Tax Number" value={supplier.tax_number ?? "—"} mono />
              <Info label="Status">
                <Badge variant={supplier.is_active ? "default" : "secondary"}>
                  {supplier.is_active ? "Active" : "Inactive"}
                </Badge>
              </Info>
            </CardContent>
          </Card>

          {supplier.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{supplier.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.addresses && supplier.addresses.length > 0 ? (
                <div className="space-y-3">
                  {supplier.addresses.map((a) => (
                    <div key={a.id} className="rounded-lg border p-3 text-sm">
                      {a.label && <p className="font-medium">{a.label}</p>}
                      <p>{a.address}</p>
                      <p className="text-muted-foreground">
                        {[a.city, a.country].filter(Boolean).join(", ") || "—"}
                      </p>
                      {a.phone && <p className="text-muted-foreground">{a.phone}</p>}
                      {a.email && <p className="text-muted-foreground">{a.email}</p>}
                      {a.is_default && (
                        <Badge variant="secondary" className="mt-2">Default</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No addresses.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.contacts && supplier.contacts.length > 0 ? (
                <div className="space-y-3">
                  {supplier.contacts.map((c) => (
                    <div key={c.id} className="rounded-lg border p-3 text-sm">
                      <p className="font-medium">{c.name}</p>
                      {c.role && <p className="text-muted-foreground">{c.role}</p>}
                      {c.phone && <p className="text-muted-foreground">{c.phone}</p>}
                      {c.email && <p className="text-muted-foreground">{c.email}</p>}
                      {c.is_primary && (
                        <Badge variant="secondary" className="mt-2">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No contacts.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {supplier.is_active ? (
                hasPermission("suppliers.delete") ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setConfirmDeactivate(true)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Deactivate
                  </Button>
                ) : null
              ) : (
                hasPermission("suppliers.update") ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReactivate}
                    disabled={deleting}
                  >
                    {deleting ? "Processing..." : "Reactivate"}
                  </Button>
                ) : null
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Created</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {supplier.created_at ? new Date(supplier.created_at).toLocaleString() : "—"}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title="Deactivate supplier?"
        description="This supplier will be hidden from active lists. You can reactivate it later."
        confirmLabel="Deactivate"
        isLoading={deleting}
        onConfirm={handleDeactivate}
      />
    </PermissionGuard>
  );
}

function Info({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>
        {children ?? value}
      </p>
    </div>
  );
}

interface SupplierWithRelations {
  id: number;
  company_id: number;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_number: string | null;
  notes: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  addresses?: SupplierAddress[];
  contacts?: SupplierContact[];
}