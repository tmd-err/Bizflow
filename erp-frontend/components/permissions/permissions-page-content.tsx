"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  getPermissionsRequest,
  groupPermissionsByResource,
  type Permission,
} from "@/lib/api/roles";

export function PermissionsPageContent() {
  const { showError } = useFormFeedback();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPermissionsRequest()
      .then((response) => setPermissions(response.permissions))
      .catch((error) =>
        showError(getApiErrorMessage(error, "Failed to load permissions."))
      )
      .finally(() => setIsLoading(false));
  }, []);

  const groups = groupPermissionsByResource(permissions);

  return (
    <PermissionGuard permission="permissions.view">
      <PageHeader
        title="Permissions"
        description="Reference list of all application permissions. Permissions are assigned to roles, not directly to users."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/roles">Manage roles</Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/users">Users</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/roles">Roles</Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner containerClassName="min-h-40" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map(({ resource, permissions: groupItems }) => (
            <Card key={resource}>
              <CardHeader>
                <CardTitle className="capitalize">{resource}</CardTitle>
                <CardDescription>
                  {groupItems.length} permission
                  {groupItems.length === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupItems.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm"
                  >
                    <KeyRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{permission.name}</p>
                      {permission.description ? (
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PermissionGuard>
  );
}
