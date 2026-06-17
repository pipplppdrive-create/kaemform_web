export type LicenseType = "free" | "trial" | "pro";

export interface StorageAddon {
  retention_days: number;
  expires_at: string | null;
}

export interface TierLimits {
  max_workspaces: number;
  max_forms_per_workspace: number;
  max_responses_per_form: number;
  retention_days: number;
  features: FeatureKey[];
}

export type FeatureKey =
  | "conditional_logic"
  | "signature"
  | "export_pdf"
  | "custom_slug"
  | "remove_branding"
  | "email_notification"
  | "desktop_app"
  | "all_templates";

export interface LicenseCache {
  type: LicenseType;
  expires_at: string | null;
  trial_started_at?: string | null;
  storage_addon?: StorageAddon | null;
  limits: TierLimits;
}

export interface LaunchTokenPayload {
  kaemnur_uid: string;
  email: string;
  name: string;
  avatar_url: string | null;
  license: {
    type: LicenseType;
    expires_at: string | null;
    storage_addon: StorageAddon;
  };
  iat: number;
  exp: number;
}
