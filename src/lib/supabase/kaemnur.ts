import type { LicenseType, StorageAddon } from "@kaemform/shared";

export interface KaemnurCheckLicenseResponse {
  found: boolean;
  kaemnur_uid?: string;
  email?: string;
  name?: string;
  avatar_url?: string | null;
  license?: {
    type: LicenseType;
    expires_at: string | null;
    storage_addon: StorageAddon;
  };
}

export function isKaemnurConfigured(): boolean {
  return Boolean(process.env.KAEMNUR_API_URL && process.env.KAEMNUR_API_KEY);
}

function buildKaemnurApiUrl(path: string): string {
  const baseUrl = process.env.KAEMNUR_API_URL;
  if (!baseUrl) {
    throw new Error("Kaemnur API is not configured (KAEMNUR_API_URL / KAEMNUR_API_KEY)");
  }

  const trimmedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const endpointPath = normalizedPath.split("?")[0] ?? "";
  const query = normalizedPath.slice(endpointPath.length);

  try {
    const base = new URL(trimmedBase);
    const basePath = base.pathname.replace(/\/+$/, "");
    if (basePath.endsWith(endpointPath)) {
      return `${trimmedBase}${query}`;
    }
  } catch {
    // Keep the configured value intact; fetch will report invalid URLs.
  }

  return `${trimmedBase}${normalizedPath}`;
}

export async function kaemnurFetch(path: string, init?: RequestInit): Promise<Response> {
  const apiKey = process.env.KAEMNUR_API_KEY;
  if (!apiKey) {
    throw new Error("Kaemnur API is not configured (KAEMNUR_API_URL / KAEMNUR_API_KEY)");
  }

  return fetch(buildKaemnurApiUrl(path), {
    ...init,
    headers: {
      ...init?.headers,
      "x-api-key": apiKey,
    },
  });
}

export async function checkLicense(params: {
  email?: string;
  kaemnur_uid?: string;
  license_code?: string;
}): Promise<KaemnurCheckLicenseResponse> {
  const search = new URLSearchParams();
  if (params.email) search.set("email", params.email);
  if (params.kaemnur_uid) search.set("kaemnur_uid", params.kaemnur_uid);
  if (params.license_code) search.set("license_code", params.license_code);

  const res = await kaemnurFetch(`/check-license?${search.toString()}`);
  if (!res.ok) {
    throw new Error(`Kaemnur check-license failed: ${res.status}`);
  }
  return res.json();
}
