"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { usePermission } from "@/hooks/use-permission";

interface PermissionGuardProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  permission,
  children,
  fallback,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, isLoading } = usePermission();

  if (isLoading) {
    return <LoadingSpinner containerClassName="min-h-[240px]" />;
  }

  const allowed = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  if (!allowed) {
    return (
      fallback ?? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border bg-muted/20 px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ShieldX className="size-5 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-medium">Access denied</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            You do not have permission to view this page. Contact your company
            administrator if you need access.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      )
    );
  }

  return <>{children}</>;
}
