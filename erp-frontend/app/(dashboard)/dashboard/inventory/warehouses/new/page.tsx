"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  createWarehouseRequest,
  type Warehouse,
} from "@/lib/api/inventory";

export default function NewWarehousePage() {
  const { showSuccess, showError } = useFormFeedback();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    address: "",
    city: "",
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await createWarehouseRequest({
        code: form.code,
        name: form.name,
        address: form.address || undefined,
        city: form.city || undefined,
      });
      showSuccess("Warehouse created.");
      window.location.href = `/dashboard/inventory/warehouses/${(r as { warehouse: Warehouse }).warehouse.id}`;
    } catch (err) {
      showError(getApiErrorMessage(err, "Failed to create warehouse."));
      setSaving(false);
    }
  }

  return (
    <PermissionGuard permission="warehouses.create">
      <PageHeader
        title="New Warehouse"
        description="Add a new storage warehouse."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/inventory/warehouses">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Code *"
                value={form.code}
                onChange={(v) => setForm({ ...form, code: v })}
                required
              />
              <Field
                label="Name *"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Address"
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
              />
              <Field
                label="City"
                value={form.city}
                onChange={(v) => setForm({ ...form, city: v })}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {saving ? "Creating..." : "Create Warehouse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PermissionGuard>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}