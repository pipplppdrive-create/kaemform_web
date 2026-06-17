"use client";

import { hasFeature, type FeatureKey } from "@kaemform/shared";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { trialDaysRemaining } from "@/lib/auth/license";

export function useLicense() {
  const { license } = useAuthContext();

  return {
    license,
    tierLimits: license.limits,
    isPro: () => license.type === "pro",
    isTrial: () => license.type === "trial",
    isFree: () => license.type === "free",
    canUseFeature: (key: FeatureKey) => hasFeature(license.limits, key),
    trialDaysRemaining: trialDaysRemaining(license),
  };
}
