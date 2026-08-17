"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import type { CreateUserFormValues } from "@/app/features/users/schemas";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { CreateUserForm } from "@/components/users/create-user-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getApiErrorMessage } from "@/lib/api/client";
import { getRolesRequest, type Role } from "@/lib/api/roles";
import { createUserRequest } from "@/lib/api/users";

export function CreateUserPageContent() {
  const router = useRouter();
  const { showError, showSuccess } = useFormFeedback();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getRolesRequest().then((response) => setRoles(response.roles)).catch((error) => showError(getApiErrorMessage(error, "Failed to load roles."))).finally(() => setIsLoadingRoles(false));
  }, [showError]);

  async function handleSubmit(values: CreateUserFormValues) {
    setIsSubmitting(true);
    try {
      const { user } = await createUserRequest(values);
      showSuccess("User created successfully.");
      router.push(`/dashboard/users/${user.id}`);
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to create user."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return <PermissionGuard permission="users.create">
    <PageHeader title="Add user" description="Create a team member in your company and optionally assign their first roles." actions={<Button asChild variant="outline"><Link href="/dashboard/users"><ArrowLeft />Back to users</Link></Button>} />
    <Card className="max-w-2xl"><CardHeader><CardTitle>User details</CardTitle><CardDescription>The user can sign in with the email address and temporary password you provide.</CardDescription></CardHeader><CardContent>{isLoadingRoles ? <LoadingSpinner containerClassName="min-h-32" /> : <CreateUserForm roles={roles} isSubmitting={isSubmitting} onSubmit={handleSubmit} />}</CardContent></Card>
  </PermissionGuard>;
}
