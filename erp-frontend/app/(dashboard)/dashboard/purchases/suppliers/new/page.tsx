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
import { createSupplierRequest } from "@/lib/api/purchasing";
import type { Supplier } from "@/lib/purchasing-types";

export default function NewSupplierPage() {
  const { showSuccess, showError } = useFormFeedback();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    tax_number: "",
    notes: "",
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await createSupplierRequest({
        code: form.code,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        tax_number: form.tax_number || undefined,
        notes: form.notes || undefined,
      });
      showSuccess("Supplier created.");
      window.location.href = `/dashboard/purchases/suppliers/${(r as { supplier: Supplier }).supplier.id}`;
    } catch (err) {
      showError(getApiErrorMessage(err, "Failed to create supplier."));
      setSaving(false);
    }
  }

  return (
    <PermissionGuard permission="suppliers.create">
      <PageHeader
        title="New Supplier"
        description="Add a new supplier or vendor."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/purchases/suppliers">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Supplier Details</CardTitle>
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
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
            </div>
            <Field
              label="Address"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="City"
                value={form.city}
                onChange={(v) => setForm({ ...form, city: v })}
              />
              <Field
                label="Country"
                value={form.country}
                onChange={(v) => setForm({ ...form, country: v })}
              />
              <Field
                label="Tax Number"
                value={form.tax_number}
                onChange={(v) => setForm({ ...form, tax_number: v })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {saving ? "Creating..." : "Create Supplier"}
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
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        type={type || "text"}
        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}