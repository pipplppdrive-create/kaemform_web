import type { LicenseType, TierLimits, FeatureKey } from "../types/license";

export const RESERVED_SLUGS = [
  "app",
  "api",
  "auth",
  "admin",
  "health",
  "status",
  "assets",
  "static",
  "login",
  "register",
  "pricing",
  "about",
  "help",
  "docs",
  "blog",
];

const TRIAL_FEATURES: FeatureKey[] = [
  "conditional_logic",
  "signature",
  "export_pdf",
  "email_notification",
  "desktop_app",
  "all_templates",
];

const PRO_FEATURES: FeatureKey[] = [
  ...TRIAL_FEATURES,
  "custom_slug",
  "remove_branding",
];

export const TIER_LIMITS: Record<LicenseType, TierLimits> = {
  free: {
    max_workspaces: 1,
    max_forms_per_workspace: 3,
    max_responses_per_form: 50,
    retention_days: 30,
    features: [],
  },
  trial: {
    max_workspaces: 3,
    max_forms_per_workspace: -1,
    max_responses_per_form: 1000,
    retention_days: 90,
    features: TRIAL_FEATURES,
  },
  pro: {
    max_workspaces: 5,
    max_forms_per_workspace: -1,
    max_responses_per_form: 10000,
    retention_days: 30,
    features: PRO_FEATURES,
  },
};

export const TRIAL_DURATION_DAYS = 14;

export const PRICING = {
  pro_yearly_idr: 99000,
  storage_addon: {
    90: 29000,
    180: 49000,
    365: 79000,
  },
} as const;

export const hasFeature = (
  limits: TierLimits | undefined,
  feature: FeatureKey
): boolean => Boolean(limits?.features?.includes(feature));
