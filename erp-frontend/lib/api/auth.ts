import {
  apiGet,
  apiPost,
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/lib/api/client";
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from "@/lib/auth/session";
import type {
  ForgotPasswordFormData,
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
} from "@/app/features/auth/schemas";
import { applyApiErrorsToForm } from "@/lib/api/forms";
import { saveSessionCache, loadSessionCache, clearSessionCache } from "@/lib/auth/session-cache";
import { normalizePermissions, normalizeRoles, parseMeResponse } from "@/lib/auth/sanitize";

export interface AuthRole {
  id: number;
  name: string;
  description?: string | null;
}

export interface AuthCompany {
  id: number;
  name: string;
  legal_name?: string | null;
  email?: string | null;
  phone?: string | null;
  currency?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  company_id?: number | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MeResponse {
  user: AuthUser;
  company: AuthCompany | null;
  roles: AuthRole[];
  permissions: string[];
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

// ── Session cache helpers ───────────────────────────────────────────────────

function buildSessionCache(data: unknown): void {
  saveSessionCache(data as Parameters<typeof saveSessionCache>[0]);
}

export function setUserFromCache(data: MeResponse | AuthResponse): void {
  const raw: unknown = {
    user: data.user
      ? {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          company_id: data.user.company_id ?? null,
          email_verified_at: data.user.email_verified_at ?? null,
          created_at: data.user.created_at ?? "",
          updated_at: data.user.updated_at ?? "",
        }
      : { id: 0, name: "", email: "", company_id: null, email_verified_at: null, created_at: "", updated_at: "" },
    company: (data as MeResponse).company ?? null,
    roles: (data as MeResponse).roles ?? [],
    permissions: (data as MeResponse).permissions ?? [],
  };
  const snapshot = JSON.parse(JSON.stringify(raw));
  saveSessionCache(snapshot);
}

function cacheToMeResponse(cache: ReturnType<typeof loadSessionCache>): MeResponse | null {
  if (!cache?.user?.id) return null;
  const u = cache.user as unknown as AuthUser;
  const c = cache.company as unknown as AuthCompany | null;
  return {
    user: u,
    company: c,
    roles: (cache.roles ?? []) as unknown as AuthRole[],
    permissions: (cache.permissions ?? []) as string[],
  };
}

export function getCachedSession(): MeResponse | null {
  return cacheToMeResponse(loadSessionCache());
}

export function setAuthToken(token: string) {
  setSessionToken(token);
}

export function clearAuthToken() {
  clearSessionToken();
}

export function getAuthToken() {
  return getSessionToken();
}

export async function loginRequest(data: LoginFormData) {
  const response = await apiPost<AuthResponse>("/api/login", data);
  if (response.token) setAuthToken(response.token);
  setUserFromCache(response);
  return response;
}

export async function registerRequest(data: RegisterFormData) {
  const response = await apiPost<AuthResponse>("/api/register", data);
  if (response.token) setAuthToken(response.token);
  setUserFromCache(response);
  return response;
}

let meCache: Promise<MeResponse> | null = null;

export async function meRequest(): Promise<MeResponse> {
  if (meCache) return meCache;

  meCache = apiGet<MeResponse>("/api/me").then((response) => {
    setUserFromCache(response);
    return response;
  });

  return meCache;
}

export async function logoutRequest() {
  return apiPost<{ message: string }>("/api/logout");
}

export async function logout() {
  try {
    if (getSessionToken()) {
      await logoutRequest();
    }
  } catch {
    // Always clear the local session even if the API call fails.
  } finally {
    clearSessionToken();
    clearSessionCache();
  }
}

export async function forgotPasswordRequest(data: ForgotPasswordFormData) {
  return apiPost<{ message: string }>("/api/forgot-password", data);
}

export async function resetPasswordRequest(data: ResetPasswordFormData) {
  return apiPost<{ message: string }>("/api/reset-password", data);
}

export { applyApiErrorsToForm };
export { getApiErrorMessage, getApiValidationErrors };
