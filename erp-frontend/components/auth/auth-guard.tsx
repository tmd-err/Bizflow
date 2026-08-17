"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { hasSessionToken } from "@/lib/auth/session";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasSessionToken()) {
      router.replace("/login");
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      fallback ?? (
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Checking session...
        </div>
      )
    );
  }

  return <>{children}</>;
}
