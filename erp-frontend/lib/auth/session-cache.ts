export interface SessionCache {
  user?: Record<string, unknown>;
  company?: Record<string, unknown> | null;
  roles?: Array<Record<string, unknown>>;
  permissions?: string[];
}

export const SESSION_CACHE_KEY = "bizflow_session_cache";

/**
 * Save a full auth snapshot to localStorage so the UI can render
 * instantly on remount without calling /api/me.
 */
export function saveSessionCache(data: SessionCache): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data));
}

/**
 * Load the previously cached auth snapshot. Returns null if absent or corrupt.
 */
export function loadSessionCache(): SessionCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionCache;
  } catch {
    return null;
  }
}

/** Wipe the cached snapshot and the auth token. */
export function clearSessionCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_CACHE_KEY);
}