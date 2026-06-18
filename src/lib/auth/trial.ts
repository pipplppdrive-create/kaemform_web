import { TIER_LIMITS, TRIAL_DURATION_DAYS, type LicenseCache } from "@kaemform/shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveEffectiveLicense } from "./license";

const DAY_MS = 24 * 60 * 60 * 1000;

export function createWorkspaceTrialCache(startedAt = new Date()): LicenseCache {
  return {
    type: "trial",
    expires_at: new Date(startedAt.getTime() + TRIAL_DURATION_DAYS * DAY_MS).toISOString(),
    trial_started_at: startedAt.toISOString(),
    storage_addon: null,
    limits: TIER_LIMITS.trial,
  };
}

export function mergeIncomingLicenseWithLocalTrial(
  incoming: LicenseCache,
  existing: LicenseCache | null | undefined
): LicenseCache {
  const trialStartedAt = incoming.trial_started_at ?? existing?.trial_started_at ?? null;
  const existingEffective = resolveEffectiveLicense(existing);

  if (incoming.type === "free" && existingEffective.type === "trial") {
    return existingEffective;
  }

  return {
    ...incoming,
    trial_started_at: trialStartedAt,
    limits: TIER_LIMITS[incoming.type],
  };
}

export async function startWorkspaceTrialIfEligible(userId: string): Promise<LicenseCache | null> {
  const admin = createAdminClient();
  const { data: user } = await admin
    .from("users")
    .select("license_cache")
    .eq("id", userId)
    .maybeSingle();

  const current = user?.license_cache as LicenseCache | null | undefined;
  const effective = resolveEffectiveLicense(current);

  if (effective.type !== "free" || current?.trial_started_at) {
    return null;
  }

  const trial = createWorkspaceTrialCache();
  const { error } = await admin
    .from("users")
    .update({ license_cache: trial, license_synced_at: new Date().toISOString() })
    .eq("id", userId);

  return error ? null : trial;
}
