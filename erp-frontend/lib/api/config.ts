export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getApiBaseUrl() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  return API_URL.replace(/\/$/, "");
}

export function getApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
