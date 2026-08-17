import { CompanySetupForm } from "@/components/onboarding/company-setup-form";

export default function CompanySetupPage() {
  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Company information
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us about your business to finish setting up your workspace.
        </p>
      </div>

      <CompanySetupForm />
    </div>
  );
}
