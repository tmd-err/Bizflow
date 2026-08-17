import {
  apiDelete,
  apiGet,
  apiPost,
} from "@/lib/api/client";
import type { Role } from "@/lib/api/roles";

export interface CompanyUser {
  id: number;
  name: string;
  email: string;
  company_id?: number | null;
  created_at?: string;
  roles?: Role[];
}

export interface CreateCompanyUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_ids?: number[];
}

export async function getUsersRequest() {
  return apiGet<{ users: CompanyUser[] }>("/api/users");
}

export async function getUserRequest(id: number) {
  return apiGet<{ user: CompanyUser }>(`/api/users/${id}`);
}

export async function createUserRequest(data: CreateCompanyUserData) {
  return apiPost<{ message: string; user: CompanyUser }>("/api/users", data);
}

export async function assignUserRoleRequest(userId: number, roleId: number) {
  return apiPost<{ message: string; roles: Role[] }>(
    `/api/users/${userId}/roles`,
    { role_id: roleId }
  );
}

export async function removeUserRoleRequest(userId: number, roleId: number) {
  return apiDelete<{ message: string; roles: Role[] }>(
    `/api/users/${userId}/roles/${roleId}`
  );
}
