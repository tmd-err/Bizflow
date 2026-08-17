import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/lib/api/client";

export interface Permission {
  id: number;
  name: string;
  description?: string | null;
}

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  company_id?: number;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
}

export async function getRolesRequest() {
  return apiGet<{ roles: Role[] }>("/api/roles");
}

export async function getRoleRequest(id: number) {
  return apiGet<{ role: Role }>(`/api/roles/${id}`);
}

export async function createRoleRequest(data: RoleFormData) {
  return apiPost<{ message: string; role: Role }>("/api/roles", data);
}

export async function updateRoleRequest(id: number, data: RoleFormData) {
  return apiPatch<{ message: string; role: Role }>(`/api/roles/${id}`, data);
}

export async function deleteRoleRequest(id: number) {
  return apiDelete<{ message: string }>(`/api/roles/${id}`);
}

export async function syncRolePermissionsRequest(
  id: number,
  permissions: string[]
) {
  return apiPut<{ message: string; role: Role }>(
    `/api/roles/${id}/permissions`,
    { permissions }
  );
}

export async function getPermissionsRequest() {
  return apiGet<{ permissions: Permission[] }>("/api/permissions");
}

export const DEFAULT_ROLE_NAMES = [
  "Admin",
  "Manager",
  "Accountant",
  "Employee",
] as const;

export function isDefaultRole(name: string) {
  return DEFAULT_ROLE_NAMES.some(
    (roleName) => roleName.toLowerCase() === name.toLowerCase()
  );
}

export function groupPermissionsByResource(permissions: Permission[]) {
  const groups = new Map<string, Permission[]>();

  for (const permission of permissions) {
    const [resource] = permission.name.split(".");
    const key = resource || "other";
    const existing = groups.get(key) ?? [];
    existing.push(permission);
    groups.set(key, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([resource, items]) => ({
      resource,
      permissions: items.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
