"use client";

import { useAuthUser } from "@/hooks/use-auth-user";

export function usePermission() {
  const { permissions = [], roles = [], isLoading = true } = useAuthUser();

  function hasPermission(permission: string) {
    return permissions.includes(permission);
  }

  function hasAnyPermission(required: string[]) {
    return required.some((permission) => permissions.includes(permission));
  }

  function hasAllPermissions(required: string[]) {
    return required.every((permission) => permissions.includes(permission));
  }

  function hasRole(roleName: string) {
    return roles.some(
      (role) => role.name.toLowerCase() === roleName.toLowerCase()
    );
  }

  return {
    permissions,
    roles,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}
