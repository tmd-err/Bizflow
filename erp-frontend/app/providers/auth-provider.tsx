"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AuthUser, MeResponse } from "@/lib/api/auth";
import { getAuthToken, meRequest, getCachedSession } from "@/lib/api/auth";
import { normalizePermissions, normalizeRoles } from "@/lib/auth/sanitize";

interface AuthContextValue {
  user: AuthUser | null;
  roles: MeResponse["roles"];
  permissions: string[];
  company: MeResponse["company"];
  isLoading: boolean;
  refresh: () => Promise<MeResponse | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<MeResponse["roles"]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [company, setCompany] = useState<MeResponse["company"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (): Promise<MeResponse | null> => {
    const token = getAuthToken();

    if (!token) {
      setUser(null);
      setRoles([]);
      setPermissions([]);
      setCompany(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);

    try {
      const response = await meRequest();
      setUser(response.user ?? null);
      setRoles(normalizeRoles(response.roles));
      setPermissions(normalizePermissions(response.permissions));
      setCompany(response.company ?? null);
      return response;
    } catch {
      setUser(null);
      setRoles([]);
      setPermissions([]);
      setCompany(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hydrate from cache synchronously on mount so the UI renders
  // instantly, then always refresh from the server to ensure
  // permissions are up to date (the cache may be stale after
  // new permissions are added).
  useEffect(() => {
    const cached = getCachedSession();

    if (cached) {
      setUser(cached.user);
      setRoles(cached.roles);
      setPermissions(cached.permissions);
      setCompany(cached.company);
      setIsLoading(false);
    }

    // Always refresh from the server when a token exists so that
    // newly-granted permissions are picked up without requiring
    // the user to log out and back in.
    const token = getAuthToken();
    if (token) {
      void refresh();
    } else if (!cached) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      roles,
      permissions,
      company,
      isLoading,
      refresh,
    }),
    [user, roles, permissions, company, isLoading, refresh]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}