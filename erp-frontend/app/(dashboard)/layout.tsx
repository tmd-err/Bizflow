import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { CompanyRequiredGuard } from "@/components/onboarding/company-required-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <CompanyRequiredGuard>
        <DashboardShell>{children}</DashboardShell>
      </CompanyRequiredGuard>
    </AuthGuard>
  );
}
