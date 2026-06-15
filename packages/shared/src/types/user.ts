import type { LicenseCache } from "./license";

export interface UserSettings {
  locale?: "id" | "en";
  [key: string]: unknown;
}

export interface User {
  id: string;
  kaemnur_uid: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  license_cache: LicenseCache;
  license_synced_at: string | null;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}
