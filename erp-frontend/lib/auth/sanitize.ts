import type { AuthUser, AuthRole, AuthCompany, MeResponse } from "@/lib/api/auth";

export function normalizePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).filter(
      (item): item is string => typeof item === "string"
    );
  }

  return [];
}

export function normalizeRoles(value: unknown): AuthRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (role): role is AuthRole =>
      Boolean(role) && typeof role === "object" && "id" in role && "name" in role
  );
}

export function parseMeResponse(data: unknown): Omit<MeResponse, "user"> & { user: AuthUser | null } {
  if (!data || typeof data !== "object") {
    return { user: null, company: null, roles: [], permissions: [] };
  }

  const record = data as Record<string, unknown>;

  return {
    user: record.user as AuthUser | null,
    company: (record.company as AuthCompany | null) ?? null,
    roles: normalizeRoles(record.roles),
    permissions: normalizePermissions(record.permissions),
  };
}