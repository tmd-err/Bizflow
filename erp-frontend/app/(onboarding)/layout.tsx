import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { CompanySetupGuard } from "@/components/onboarding/company-setup-guard";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

interface OnboardingRootLayoutProps {
  children: ReactNode;
}

export default function OnboardingRootLayout({
  children,
}: OnboardingRootLayoutProps) {
  return (
    <AuthGuard>
      <CompanySetupGuard>
        <OnboardingLayout>{children}</OnboardingLayout>
      </CompanySetupGuard>
    </AuthGuard>
  );
}
