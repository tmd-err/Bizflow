"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Shield } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { RoleTable } from "@/components/roles/role-table";
import { Button } from "@/components/ui/button";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { usePermission } from "@/hooks/use-permission";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  deleteRoleRequest,
  getRolesRequest,
  type Role,
} from "@/lib/api/roles";

export function RolesPageContent() {
  const { hasPermission } = usePermission();
  const { showError, showSuccess } = useFormFeedback();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadRoles() {
    setIsLoading(true);

    try {
      const response = await getRolesRequest();
      setRoles(response.roles);
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to load roles."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRoles();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // `loadRoles` is intentionally scoped to this page and uses current feedback state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete() {
    if (!roleToDelete) return;

    setIsDeleting(true);

    try {
      await deleteRoleRequest(roleToDelete.id);
      showSuccess("Role deleted successfully.");
      setRoleToDelete(null);
      await loadRoles();
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to delete role."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <PermissionGuard permission="roles.view">
      <PageHeader
        title="Roles"
        description="Manage company roles and the permissions assigned to each role."
        actions={
          hasPermission("roles.create") ? (
            <Button asChild>
              <Link href="/dashboard/roles/create">
                <Plus />
                Create role
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/users">Users</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/permissions">Permissions</Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner containerClassName="min-h-40" />
      ) : roles.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No roles yet"
          description="Create a role to define what members of your company can access."
          action={
            hasPermission("roles.create") ? (
              <Button asChild>
                <Link href="/dashboard/roles/create">
                  <Plus />
                  Create role
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <RoleTable roles={roles} onDelete={setRoleToDelete} />
      )}

      <ConfirmDialog
        open={Boolean(roleToDelete)}
        onOpenChange={(open) => {
          if (!open) setRoleToDelete(null);
        }}
        title="Delete role"
        description={`Are you sure you want to delete "${roleToDelete?.name}"? Users assigned to this role will lose its permissions.`}
        confirmLabel="Delete role"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </PermissionGuard>
  );
}
