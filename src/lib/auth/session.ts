import { randomUUID } from "crypto";
import type { LicenseCache } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultLicenseCache, resolveEffectiveLicense } from "./license";

export interface SessionUser {
  id: string;
  email: string;
  license: LicenseCache;
}

/** Resolves the authenticated user (if any) plus their effective license/tier limits. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("users")
    .select("license_cache")
    .eq("id", user.id)
    .maybeSingle();

  let cache = (row?.license_cache as LicenseCache | null | undefined) ?? null;

  if (!row) {
    // First request after a direct auth session: the `users` row
    // (separate from `auth.users`) doesn't exist yet, so provision it here
    // with the free fallback until Kaemnur provides the real license.
    cache = getDefaultLicenseCache();
    const { error: insertError } = await admin.from("users").insert({
      id: user.id,
      kaemnur_uid: (user.user_metadata?.kaemnur_uid as string | undefined) ?? randomUUID(),
      email: user.email,
      name:
        (user.user_metadata?.name as string | undefined) ??
        (user.user_metadata?.full_name as string | undefined) ??
        null,
      avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      license_cache: cache,
      license_synced_at: new Date().toISOString(),
    });
    if (insertError && insertError.code !== "23505") {
      throw insertError;
    }
  }

  return {
    id: user.id,
    email: user.email,
    license: resolveEffectiveLicense(cache ?? getDefaultLicenseCache()),
  };
}
