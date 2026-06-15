import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { TIER_LIMITS, type LicenseCache } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLicense, isKaemnurConfigured } from "@/lib/supabase/kaemnur";
import { getDefaultLicenseCache } from "@/lib/auth/license";
import { syncLicense } from "@/lib/auth/license-sync";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Google OAuth callback. If the Kaemnur bridge is configured, new users are
 * provisioned via check-license (rejecting unknown emails). Otherwise
 * (standalone/manual phase) a new user is created with the default Pro
 * cache so the admin can sign in directly with Google.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=unknown`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user || !data.user.email) {
    return NextResponse.redirect(`${origin}/login?error=unknown`);
  }

  const authUser = data.user;
  const admin = createAdminClient();

  const { data: existingUser } = await admin
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (!existingUser) {
    let licenseCache: LicenseCache = getDefaultLicenseCache();
    let kaemnurUid: string = randomUUID();
    let name: string | null =
      (authUser.user_metadata?.full_name as string | undefined) ??
      (authUser.user_metadata?.name as string | undefined) ??
      null;
    let avatarUrl: string | null = (authUser.user_metadata?.avatar_url as string | undefined) ?? null;

    if (isKaemnurConfigured()) {
      try {
        const result = await checkLicense({ email: authUser.email });
        if (!result.found) {
          return NextResponse.redirect(`${origin}/login?error=not_registered`);
        }
        kaemnurUid = result.kaemnur_uid ?? kaemnurUid;
        name = result.name ?? name;
        avatarUrl = result.avatar_url ?? avatarUrl;
        if (result.license) {
          licenseCache = {
            type: result.license.type,
            expires_at: result.license.expires_at,
            storage_addon: result.license.storage_addon,
            limits: TIER_LIMITS[result.license.type],
          };
        }
      } catch {
        return NextResponse.redirect(`${origin}/login?error=unknown`);
      }
    }

    await admin.from("users").insert({
      id: authUser.id,
      kaemnur_uid: kaemnurUid,
      email: authUser.email,
      name,
      avatar_url: avatarUrl,
      license_cache: licenseCache,
      license_synced_at: new Date().toISOString(),
    });
  } else if (isKaemnurConfigured()) {
    const syncedAt = existingUser.license_synced_at
      ? new Date(existingUser.license_synced_at as string).getTime()
      : 0;
    if (Date.now() - syncedAt > ONE_DAY_MS) {
      await syncLicense(existingUser.id as string, existingUser.kaemnur_uid as string);
    }
  }

  return NextResponse.redirect(`${origin}/app`);
}
