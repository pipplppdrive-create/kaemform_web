import { NextResponse } from "next/server";
import { TIER_LIMITS, type LicenseCache } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLicense, isKaemnurConfigured } from "@/lib/supabase/kaemnur";

async function rejectLogin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  origin: string,
  error: string
) {
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/login?error=${error}`);
}

/**
 * Google OAuth callback. Supabase Project B owns the KaemForm session, while
 * account identity and license data are resolved from Kaemnur Project A.
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
    return rejectLogin(supabase, origin, "unknown");
  }

  if (!isKaemnurConfigured()) {
    return rejectLogin(supabase, origin, "bridge_unconfigured");
  }

  const authUser = data.user;
  const admin = createAdminClient();

  const { data: existingUser } = await admin
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  let result;
  try {
    result = await checkLicense({ email: authUser.email });
  } catch {
    return rejectLogin(supabase, origin, "unknown");
  }

  if (!result.found || !result.kaemnur_uid || !result.license) {
    return rejectLogin(supabase, origin, "not_registered");
  }

  const licenseCache: LicenseCache = {
    type: result.license.type,
    expires_at: result.license.expires_at,
    storage_addon: result.license.storage_addon,
    limits: TIER_LIMITS[result.license.type],
  };
  const userRecord = {
    kaemnur_uid: result.kaemnur_uid,
    email: authUser.email,
    name:
      result.name ??
      (authUser.user_metadata?.full_name as string | undefined) ??
      (authUser.user_metadata?.name as string | undefined) ??
      null,
    avatar_url:
      result.avatar_url ??
      (authUser.user_metadata?.avatar_url as string | undefined) ??
      null,
    license_cache: licenseCache,
    license_synced_at: new Date().toISOString(),
  };

  const { error: profileError } = existingUser
    ? await admin.from("users").update(userRecord).eq("id", authUser.id)
    : await admin.from("users").insert({
      id: authUser.id,
      ...userRecord,
    });

  if (profileError) {
    return rejectLogin(supabase, origin, "account_conflict");
  }

  return NextResponse.redirect(`${origin}/app`);
}
