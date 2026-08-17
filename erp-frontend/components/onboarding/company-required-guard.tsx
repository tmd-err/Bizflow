"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuthUser } from "@/hooks/use-auth-user";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface CompanyRequiredGuardProps {
  children: ReactNode;
}

export function CompanyRequiredGuard({ children }: CompanyRequiredGuardProps) {
  const router = useRouter();
  const { user, company, isLoading } = useAuthUser();
  const hasCompany = Boolean(user?.company_id ?? company?.id);

  useEffect(() => {
    if (isLoading) return;

    if (!hasCompany) {
      router.replace("/setup/company");
    }
  }, [hasCompany, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner containerClassName="min-h-[40vh]" />;
  }

  if (!hasCompany) {
    return null;
  }

  return <>{children}</>;
}
