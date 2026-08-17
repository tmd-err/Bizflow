"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Shield, Users } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { UserTable } from "@/components/users/user-table";
import { Button } from "@/components/ui/button";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { usePermission } from "@/hooks/use-permission";
import { getApiErrorMessage } from "@/lib/api/client";
import { getUsersRequest, type CompanyUser } from "@/lib/api/users";

export function UsersPageContent() {
  const { hasPermission } = usePermission();
  const { showError } = useFormFeedback();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUsersRequest()
      .then((response) => setUsers(response.users))
      .catch((error) =>
        showError(getApiErrorMessage(error, "Failed to load users."))
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PermissionGuard permission="users.view">
      <PageHeader
        title="Users & Roles"
        description="View team members and manage the roles assigned to each user."
        actions={
          <>
            {hasPermission("roles.view") ? <Button asChild variant="outline"><Link href="/dashboard/roles"><Shield />Manage roles</Link></Button> : null}
            {hasPermission("users.create") ? <Button asChild><Link href="/dashboard/users/create"><Plus />Add user</Link></Button> : null}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/users">Users</Link>
        </Button>
        {hasPermission("roles.view") ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/roles">Roles</Link>
          </Button>
        ) : null}
        {hasPermission("permissions.view") ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/permissions">Permissions</Link>
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingSpinner containerClassName="min-h-40" />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Team members will appear here once they belong to your company."
        />
      ) : (
        <UserTable users={users} />
      )}
    </PermissionGuard>
  );
}
