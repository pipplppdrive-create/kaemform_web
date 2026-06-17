import { TIER_LIMITS, TRIAL_DURATION_DAYS, type LicenseCache } from "@kaemform/shared";

/**
 * Default cache for normal users when no Kaemnur payload exists yet. Real
 * user licenses should arrive from Kaemnur and replace this cache at login.
 */
export function getDefaultLicenseCache(): LicenseCache {
  return {
    type: "free",
    expires_at: null,
    trial_started_at: null,
    storage_addon: null,
    limits: TIER_LIMITS.free,
  };
}

/** Local-only Pro cache for the hidden manual admin fallback. */
export function getManualAdminLicenseCache(): LicenseCache {
  return {
    type: "pro",
    expires_at: null,
    trial_started_at: null,
    storage_addon: null,
    limits: TIER_LIMITS.pro,
  };
}

/**
 * Apply expiry rules to a cached license. A Pro/Trial license whose
 * `expires_at` is in the past is treated as Free until re-synced.
 */
export function resolveEffectiveLicense(cache: LicenseCache | null | undefined): LicenseCache {
  if (!cache || !cache.type) {
    return getDefaultLicenseCache();
  }

  if (cache.type === "free") {
    return { ...cache, limits: cache.limits ?? TIER_LIMITS.free };
  }

  if (cache.expires_at && new Date(cache.expires_at).getTime() < Date.now()) {
    return { ...cache, type: "free", limits: TIER_LIMITS.free };
  }

  return { ...cache, limits: cache.limits ?? TIER_LIMITS[cache.type] };
}

/** Days remaining in a trial license (0 if not on trial or expired). */
export function trialDaysRemaining(cache: LicenseCache): number {
  if (cache.type !== "trial" || !cache.expires_at) return 0;
  const diffMs = new Date(cache.expires_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export const TRIAL_LENGTH_DAYS = TRIAL_DURATION_DAYS;
