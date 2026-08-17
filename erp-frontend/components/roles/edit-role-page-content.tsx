"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionSelector } from "@/components/roles/permission-selector";
import { RoleForm } from "@/components/roles/role-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { usePermission } from "@/hooks/use-permission";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  deleteRoleRequest,
  getPermissionsRequest,
  getRoleRequest,
  isDefaultRole,
  syncRolePermissionsRequest,
  updateRoleRequest,
  type Permission,
  type Role,
} from "@/lib/api/roles";

interface EditRolePageContentProps {
  roleId: number;
}

export function EditRolePageContent({ roleId }: EditRolePageContentProps) {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const { showError, showSuccess } = useFormFeedback();
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadRole() {
    setIsLoading(true);

    try {
      const [roleResponse, permissionsResponse] = await Promise.all([
        getRoleRequest(roleId),
        getPermissionsRequest(),
      ]);

      setRole(roleResponse.role);
      setPermissions(permissionsResponse.permissions);
      setSelectedPermissions(
        roleResponse.role.permissions?.map((permission) => permission.name) ?? []
      );
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to load role."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRole();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // `loadRole` is intentionally scoped to this page and the current role id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await deleteRoleRequest(roleId);
      showSuccess("Role deleted successfully.");
      router.push("/dashboard/roles");
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to delete role."));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner containerClassName="min-h-[320px]" />;
  }

  if (!role) {
    return (
      <div className="rounded-xl border bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Role not found.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/roles">Back to roles</Link>
        </Button>
      </div>
    );
  }

  const canDelete =
    hasPermission("roles.delete") && !isDefaultRole(role.name);

  return (
    <PermissionGuard permission="roles.view">
      <PageHeader
        title={role.name}
        description="Update role details and manage permissions."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/roles">
                <ArrowLeft />
                Back to roles
              </Link>
            </Button>
            {canDelete ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete role
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Role details</CardTitle>
            <CardDescription>Update the role name and description.</CardDescription>
          </CardHeader>
          <CardContent>
            {hasPermission("roles.update") ? (
              <RoleForm
                defaultValues={{
                  name: role.name,
                  description: role.description ?? "",
                }}
                isSubmitting={isSavingDetails}
                submitLabel="Save details"
                onSubmit={async (values) => {
                  setIsSavingDetails(true);

                  try {
                    const response = await updateRoleRequest(roleId, values);
                    setRole(response.role);
                    showSuccess("Role updated successfully.");
                  } catch (error) {
                    showError(getApiErrorMessage(error, "Failed to update role."));
                  } finally {
                    setIsSavingDetails(false);
                  }
                }}
              />
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{role.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Description</p>
                  <p>{role.description || "No description provided."}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Control what users with this role can access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PermissionSelector
              permissions={permissions}
              selected={selectedPermissions}
              onChange={setSelectedPermissions}
              disabled={!hasPermission("roles.update")}
            />
            {hasPermission("roles.update") ? (
              <Button
                disabled={isSavingPermissions}
                onClick={async () => {
                  setIsSavingPermissions(true);

                  try {
                    const response = await syncRolePermissionsRequest(
                      roleId,
                      selectedPermissions
                    );
                    setRole(response.role);
                    showSuccess("Permissions updated successfully.");
                  } catch (error) {
                    showError(
                      getApiErrorMessage(error, "Failed to update permissions.")
                    );
                  } finally {
                    setIsSavingPermissions(false);
                  }
                }}
              >
                {isSavingPermissions ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving permissions...
                  </>
                ) : (
                  "Save permissions"
                )}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete role"
        description={`Are you sure you want to delete "${role.name}"?`}
        confirmLabel="Delete role"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </PermissionGuard>
  );
}
