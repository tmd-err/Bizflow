"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
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
  createRoleRequest,
  getPermissionsRequest,
  syncRolePermissionsRequest,
  type Permission,
} from "@/lib/api/roles";

export function CreateRolePageContent() {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const { showError, showSuccess } = useFormFeedback();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getPermissionsRequest()
      .then((response) => setPermissions(response.permissions))
      .catch((error) =>
        showError(getApiErrorMessage(error, "Failed to load permissions."))
      );
  }, []);

  return (
    <PermissionGuard permission="roles.create">
      <PageHeader
        title="Create role"
        description="Define a new role for your company and choose its permissions."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/roles">
              <ArrowLeft />
              Back to roles
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Role details</CardTitle>
            <CardDescription>Name and describe the role.</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleForm
              isSubmitting={isSubmitting}
              submitLabel="Create role"
              onSubmit={async (values) => {
                setIsSubmitting(true);

                try {
                  const response = await createRoleRequest(values);

                  if (selectedPermissions.length > 0 && hasPermission("roles.update")) {
                    await syncRolePermissionsRequest(
                      response.role.id,
                      selectedPermissions
                    );
                  }

                  showSuccess("Role created successfully.");
                  router.push(`/dashboard/roles/${response.role.id}`);
                } catch (error) {
                  showError(getApiErrorMessage(error, "Failed to create role."));
                } finally {
                  setIsSubmitting(false);
                }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Choose what this role is allowed to do.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionSelector
              permissions={permissions}
              selected={selectedPermissions}
              onChange={setSelectedPermissions}
              disabled={!hasPermission("roles.update")}
            />
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
