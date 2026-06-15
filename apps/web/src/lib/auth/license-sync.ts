import { createAdminClient } from "@/lib/supabase/admin";
import { checkLicense, isKaemnurConfigured } from "@/lib/supabase/kaemnur";
import { TIER_LIMITS, type LicenseCache } from "@kaemform/shared";

/**
 * Sync a user's license_cache from the Kaemnur API. No-op (returns the
 * current cache unchanged) while the Kaemnur bridge is not configured —
 * during this phase the admin keeps the default Pro cache set at signup.
 */
export async function syncLicense(userId: string, kaemnurUid: string): Promise<LicenseCache | null> {
  if (!isKaemnurConfigured()) {
    return null;
  }

  const admin = createAdminClient();
  const result = await checkLicense({ kaemnur_uid: kaemnurUid });

  if (!result.found || !result.license) {
    return null;
  }

  const cache: LicenseCache = {
    type: result.license.type,
    expires_at: result.license.expires_at,
    storage_addon: result.license.storage_addon,
    limits: TIER_LIMITS[result.license.type],
  };

  await admin
    .from("users")
    .update({ license_cache: cache, license_synced_at: new Date().toISOString() })
    .eq("id", userId);

  return cache;
}
