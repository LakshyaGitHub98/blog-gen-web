export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export const MOCK_ENABLED = process.env.NEXT_PUBLIC_MOCK === "true";

export function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_URL ? `${API_URL}${p}` : p;
}
