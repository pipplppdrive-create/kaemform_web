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

/** True once KAEMNUR_API_URL / KAEMNUR_API_KEY are configured (Kaemnur bridge revision). */
export function isKaemnurConfigured(): boolean {
  return Boolean(process.env.KAEMNUR_API_URL && process.env.KAEMNUR_API_KEY);
}

/**
 * Fetch wrapper for the Kaemnur API (Project A). Throws if the bridge is
 * not configured — callers should check `isKaemnurConfigured()` first and
 * fall back to local defaults during the standalone-login phase.
 */
export async function kaemnurFetch(path: string, init?: RequestInit): Promise<Response> {
  const baseUrl = process.env.KAEMNUR_API_URL;
  const apiKey = process.env.KAEMNUR_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Kaemnur API is not configured (KAEMNUR_API_URL / KAEMNUR_API_KEY)");
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      "x-api-key": apiKey,
    },
  });
}

/** GET check-license by email, kaemnur_uid, or a purchase license code. */
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
