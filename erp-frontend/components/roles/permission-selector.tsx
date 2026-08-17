"use client";

import { cn } from "@/lib/utils";
import {
  groupPermissionsByResource,
  type Permission,
} from "@/lib/api/roles";

interface PermissionSelectorProps {
  permissions: Permission[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

export function PermissionSelector({
  permissions,
  selected,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const groups = groupPermissionsByResource(permissions);

  function togglePermission(name: string) {
    if (disabled) return;

    if (selected.includes(name)) {
      onChange(selected.filter((item) => item !== name));
      return;
    }

    onChange([...selected, name]);
  }

  function toggleGroup(groupPermissions: Permission[]) {
    if (disabled) return;

    const names = groupPermissions.map((permission) => permission.name);
    const allSelected = names.every((name) => selected.includes(name));

    if (allSelected) {
      onChange(selected.filter((name) => !names.includes(name)));
      return;
    }

    onChange(Array.from(new Set([...selected, ...names])));
  }

  if (permissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No permissions available.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(({ resource, permissions: groupItems }) => {
        const groupNames = groupItems.map((permission) => permission.name);
        const selectedCount = groupNames.filter((name) =>
          selected.includes(name)
        ).length;
        const allSelected = selectedCount === groupNames.length;

        return (
          <div key={resource} className="rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="font-medium capitalize">{resource}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedCount} of {groupNames.length} selected
                </p>
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleGroup(groupItems)}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {groupItems.map((permission) => {
                const isChecked = selected.includes(permission.name);

                return (
                  <label
                    key={permission.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 transition-colors",
                      isChecked
                        ? "border-primary/30 bg-primary/5"
                        : "border-transparent bg-muted/30 hover:bg-muted/50",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 rounded border-input"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={() => togglePermission(permission.name)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {permission.name.split(".")[1] ?? permission.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {permission.name}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
