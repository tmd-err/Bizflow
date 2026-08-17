import axios, { type AxiosError } from "axios";

import { AUTH_TOKEN_KEY, clearSessionToken } from "@/lib/auth/session";
import { getApiUrl } from "@/lib/api/config";

export { AUTH_TOKEN_KEY };

export const apiClient = axios.create({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // Let the browser add the multipart boundary when uploading files.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      clearSessionToken();

      if (!window.location.pathname.startsWith("/login")) {
        const redirect = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirect=${redirect}`;
      }
    }

    return Promise.reject(error);
  }
);

export type ApiValidationErrors = Record<string, string[]>;

export function isAxiosError(error: unknown): error is AxiosError<{
  message?: string;
  errors?: ApiValidationErrors;
}> {
  return axios.isAxiosError(error);
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (!isAxiosError(error)) {
    return fallback;
  }

  return error.response?.data?.message ?? fallback;
}

export function getApiValidationErrors(error: unknown) {
  if (!isAxiosError(error)) {
    return null;
  }

  return error.response?.data?.errors ?? null;
}

export async function apiPost<TResponse>(
  path: string,
  data?: unknown
): Promise<TResponse> {
  const response = await apiClient.post<TResponse>(getApiUrl(path), data);
  return response.data;
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const response = await apiClient.get<TResponse>(getApiUrl(path));
  return response.data;
}

export async function apiPatch<TResponse>(
  path: string,
  data?: unknown
): Promise<TResponse> {
  const response = await apiClient.patch<TResponse>(getApiUrl(path), data);
  return response.data;
}

export async function apiPut<TResponse>(
  path: string,
  data?: unknown
): Promise<TResponse> {
  const response = await apiClient.put<TResponse>(getApiUrl(path), data);
  return response.data;
}

export async function apiDelete<TResponse>(path: string): Promise<TResponse> {
  const response = await apiClient.delete<TResponse>(getApiUrl(path));
  return response.data;
}
