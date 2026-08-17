"use client";

export { AuthProvider, useAuthContext } from "@/app/providers/auth-provider";

import { useAuthContext } from "@/app/providers/auth-provider";

export function useAuthUser() {
  const { user, roles, permissions, company, isLoading, refresh } =
    useAuthContext();

  return {
    user,
    roles,
    permissions,
    company,
    isLoading,
    refresh,
  };
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
