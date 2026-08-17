import type { ReactNode } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";

interface AuthRootLayoutProps {
  children: ReactNode;
}

export default function AuthRootLayout({
  children,
}: AuthRootLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}