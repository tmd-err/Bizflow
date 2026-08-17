"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  getWarehouseRequest,
  updateWarehouseRequest,
} from "@/lib/api/inventory";
import type { Warehouse, WarehouseLocation } from "@/lib/inventory-types";
import { WarehouseLocationForm } from "./location-form";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default function WarehouseDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { hasPermission } = usePermission();
  const { showSuccess, showError } = useFormFeedback();

  const [warehouse, setWarehouse] = useState<
    (Warehouse & { locations: WarehouseLocation[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    address: "",
    city: "",
    is_active: true,
  });

  const load = useCallback(
    (id: number) => {
      setLoading(true);
      getWarehouseRequest(id)
        .then((w) => {
          setWarehouse(w);
          setForm({
            code: w.code,
            name: w.name,
            address: w.address ?? "",
            city: w.city ?? "",
            is_active: w.is_active,
          });
        })
        .catch((e) =>
          showError(
            getApiErrorMessage(e, "Failed to load warehouse.")
          )
        )
        .finally(() => setLoading(false));
    },
    [showError]
  );

  useEffect(() => {
    load(Number(params.id));
  }, [params.id, load]);

  function startEdit() {
    if (!warehouse) return;
    setForm({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address ?? "",
      city: warehouse.city ?? "",
      is_active: warehouse.is_active,
    });
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!warehouse) return;
    setSaving(true);
    try {
      const updated = await updateWarehouseRequest(warehouse.id, {
        code: form.code,
        name: form.name,
        address: form.address || undefined,
        city: form.city || undefined,
        is_active: form.is_active,
      });
      setWarehouse((prev) =>
        prev ? { ...prev, ...updated.warehouse } : prev
      );
      showSuccess("Warehouse updated.");
      setEditing(false);
    } catch (e) {
      showError(getApiErrorMessage(e, "Failed to update warehouse."));
    } finally {
      setSaving(false);
    }
  }

  /* location CRUD */

  const [showLocationForm, setShowLocationForm] = useState(false);

  async function onLocationCreated(loc: WarehouseLocation) {
    setWarehouse((prev) =>
      prev
        ? {
            ...prev,
            locations: [...prev.locations, loc],
          }
        : prev
    );
    setShowLocationForm(false);
    showSuccess("Location created.");
  }

  async function onLocationDeleted(id: number) {
    setWarehouse((prev) =>
      prev
        ? {
            ...prev,
            locations: prev.locations.filter((l) => l.id !== id),
          }
        : prev
    );
    showSuccess("Location deleted.");
  }

  /* render */

  if (loading) return <LoadingSpinner containerClassName="min-h-[60vh]" />;

  if (!warehouse) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Warehouse not found.</p>
      </div>
    );
  }

  return (
    <PermissionGuard permission="warehouses.view">
      <PageHeader
        title={warehouse.name}
        description={`Code: ${warehouse.code}`}
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/inventory/warehouses">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Details</CardTitle>
            {!editing && hasPermission("warehouses.update") && (
              <Button size="sm" variant="outline" onClick={startEdit}>
                <Edit className="mr-2 size-4" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={save} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Code</label>
                    <input
                      className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Name</label>
                    <input
                      className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Address</label>
                    <input
                      className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">City</label>
                    <input
                      className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                  />
                  Active
                </label>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="Code">{warehouse.code}</Field>
                <Field label="Name">{warehouse.name}</Field>
                <Field label="Address">
                  {warehouse.address ?? "—"}
                </Field>
                <Field label="City">{warehouse.city ?? "—"}</Field>
                <Field label="Status">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      warehouse.is_active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {warehouse.is_active ? "Active" : "Inactive"}
                  </span>
                </Field>
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Locations card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Locations</CardTitle>
            {hasPermission("warehouses.create") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLocationForm(!showLocationForm)}
              >
                <Plus className="mr-2 size-4" />
                Add location
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {showLocationForm && warehouse && (
              <WarehouseLocationForm
                warehouseId={warehouse.id}
                onCreated={onLocationCreated}
                onCancel={() => setShowLocationForm(false)}
              />
            )}

            {warehouse.locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No locations yet.
              </p>
            ) : (
              <div className="space-y-2">
                {warehouse.locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div>
                      <p className="font-mono text-sm">{loc.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {loc.name}
                      </p>
                    </div>
                    {hasPermission("warehouses.update") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onLocationDeleted(loc.id)
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}