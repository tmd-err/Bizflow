"use client";

import { useState, type FormEvent } from "react";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getApiErrorMessage } from "@/lib/api/client";
import { createWarehouseLocationRequest } from "@/lib/api/inventory";
import type { WarehouseLocation } from "@/lib/inventory-types";

export function WarehouseLocationForm({
  warehouseId,
  onCreated,
  onCancel,
}: {
  warehouseId: number;
  onCreated: (loc: WarehouseLocation) => void;
  onCancel: () => void;
}) {
  const { showSuccess, showError } = useFormFeedback();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    createWarehouseLocationRequest(warehouseId, { code, name })
      .then((r) => onCreated(r.location))
      .catch((err) =>
        showError(getApiErrorMessage(err, "Failed to create location."))
      )
      .finally(() => setSaving(false));
  }

  return (
    <form onSubmit={submit} className="mb-4 space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">New location</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Code" value={code} onChange={setCode} required />
        <InputField label="Name" value={name} onChange={setName} required />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Saving..." : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function InputField({
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
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <input
        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}