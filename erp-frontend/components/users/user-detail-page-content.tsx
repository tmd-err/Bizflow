"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { UserRoleManager } from "@/components/users/user-role-manager";
import { UserSummaryCard } from "@/components/users/user-table";
import { Button } from "@/components/ui/button";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getApiErrorMessage } from "@/lib/api/client";
import { getUserRequest, type CompanyUser } from "@/lib/api/users";

interface UserDetailPageContentProps {
  userId: number;
}

export function UserDetailPageContent({ userId }: UserDetailPageContentProps) {
  const { showError } = useFormFeedback();
  const [user, setUser] = useState<CompanyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserRequest(userId)
      .then((response) => setUser(response.user))
      .catch((error) =>
        showError(getApiErrorMessage(error, "Failed to load user."))
      )
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner containerClassName="min-h-[320px]" />;
  }

  if (!user) {
    return (
      <div className="rounded-xl border bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">User not found.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/users">Back to users</Link>
        </Button>
      </div>
    );
  }

  return (
    <PermissionGuard permission="users.view">
      <PageHeader
        title={user.name}
        description="Manage roles for this team member."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/users">
              <ArrowLeft />
              Back to users
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <UserSummaryCard user={user} />
        <UserRoleManager user={user} onUpdated={setUser} />
      </div>
    </PermissionGuard>
  );
}
