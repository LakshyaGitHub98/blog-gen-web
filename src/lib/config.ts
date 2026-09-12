function getRuntimeApiUrl(): string {
  if (typeof window !== "undefined") {
    const cfg = (window as unknown as { __CONFIG__?: { API_URL?: string } })
      .__CONFIG__;
    if (cfg?.API_URL) return cfg.API_URL.replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

export const MOCK_ENABLED = process.env.NEXT_PUBLIC_MOCK === "true";

export function apiUrl(path: string) {
  const apiBase = getRuntimeApiUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return apiBase ? `${apiBase}${p}` : p;
}
