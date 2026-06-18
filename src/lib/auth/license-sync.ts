import { createAdminClient } from "@/lib/supabase/admin";
import { checkLicense, isKaemnurConfigured } from "@/lib/supabase/kaemnur";
import { TIER_LIMITS, type LicenseCache } from "@kaemform/shared";
import { mergeIncomingLicenseWithLocalTrial } from "./trial";

type LicenseLookupResult = Awaited<ReturnType<typeof checkLicense>>;

function hasUsableLicense(
  result: LicenseLookupResult | null
): result is LicenseLookupResult & { license: NonNullable<LicenseLookupResult["license"]> } {
  return Boolean(
    result?.found &&
      result.license &&
      result.license.type !== "free" &&
      (!result.license.expires_at || new Date(result.license.expires_at).getTime() >= Date.now())
  );
}

/**
 * Sync a user's license_cache from the Kaemnur API. No-op (returns the
 * current cache unchanged) while the Kaemnur bridge is not configured -
 * during this phase the admin keeps the default Pro cache set at signup.
 */
export async function syncLicense(userId: string, kaemnurUid: string): Promise<LicenseCache | null> {
  if (!isKaemnurConfigured()) {
    return null;
  }

  const admin = createAdminClient();
  const [{ data: user }, result] = await Promise.all([
    admin.from("users").select("license_cache").eq("id", userId).maybeSingle(),
    checkLicense({ kaemnur_uid: kaemnurUid }),
  ]);

  if (!result.found || !result.license) {
    return null;
  }

  const incomingCache: LicenseCache = {
    type: result.license.type,
    expires_at: result.license.expires_at,
    storage_addon: result.license.storage_addon,
    limits: TIER_LIMITS[result.license.type],
  };
  const cache = mergeIncomingLicenseWithLocalTrial(
    incomingCache,
    user?.license_cache as LicenseCache | null | undefined
  );

  await admin
    .from("users")
    .update({ license_cache: cache, license_synced_at: new Date().toISOString() })
    .eq("id", userId);

  return cache;
}

export async function activateLicenseCode(userId: string, licenseCode: string): Promise<LicenseCache | null> {
  const code = licenseCode.trim();
  if (!code || !isKaemnurConfigured()) {
    return null;
  }

  const admin = createAdminClient();
  const { data: user } = await admin
    .from("users")
    .select("license_cache, email, kaemnur_uid")
    .eq("id", userId)
    .maybeSingle();

  let result = await checkLicense({ license_code: code }).catch(() => null);
  if (!result || !hasUsableLicense(result)) {
    result = await checkLicense({
      license_code: code,
      email: typeof user?.email === "string" ? user.email : undefined,
      kaemnur_uid: typeof user?.kaemnur_uid === "string" ? user.kaemnur_uid : undefined,
    }).catch(() => null);
  }

  if (!hasUsableLicense(result)) {
    return null;
  }

  const incomingCache: LicenseCache = {
    type: result.license.type,
    expires_at: result.license.expires_at,
    storage_addon: result.license.storage_addon,
    limits: TIER_LIMITS[result.license.type],
  };
  const cache = mergeIncomingLicenseWithLocalTrial(
    incomingCache,
    user?.license_cache as LicenseCache | null | undefined
  );
  const profilePatch: Record<string, unknown> = {
    license_cache: cache,
    license_synced_at: new Date().toISOString(),
  };

  if (result.kaemnur_uid) profilePatch.kaemnur_uid = result.kaemnur_uid;
  if (result.name) profilePatch.name = result.name;
  if (typeof result.avatar_url !== "undefined") profilePatch.avatar_url = result.avatar_url;

  await admin.from("users").update(profilePatch).eq("id", userId);

  return cache;
}
