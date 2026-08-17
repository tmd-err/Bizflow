import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner containerClassName="min-h-[320px]" />}>
      <LoginForm />
    </Suspense>
  );
}
