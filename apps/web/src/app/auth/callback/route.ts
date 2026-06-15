import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { TIER_LIMITS, type LaunchTokenPayload, type LicenseCache } from "@kaemform/shared";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Launch Token callback (Auth Bridge Path 1 — Kaemnur → KaemForm).
 * Requires LAUNCH_TOKEN_SECRET to be configured (Kaemnur bridge revision).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const origin = url.origin;
  const secret = process.env.LAUNCH_TOKEN_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  let payload: LaunchTokenPayload;
  try {
    const { payload: verified } = await jwtVerify(token, new TextEncoder().encode(secret));
    payload = verified as unknown as LaunchTokenPayload;
    if (!payload.kaemnur_uid || !payload.email || !payload.license) {
      throw new Error("Invalid payload");
    }
  } catch {
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  const admin = createAdminClient();
  const licenseCache: LicenseCache = {
    type: payload.license.type,
    expires_at: payload.license.expires_at,
    storage_addon: payload.license.storage_addon,
    limits: TIER_LIMITS[payload.license.type],
  };

  const { data: existingUser } = await admin
    .from("users")
    .select("*")
    .eq("kaemnur_uid", payload.kaemnur_uid)
    .maybeSingle();

  let email = payload.email;

  if (!existingUser) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: payload.email,
      email_confirm: true,
      user_metadata: {
        name: payload.name,
        avatar_url: payload.avatar_url,
        kaemnur_uid: payload.kaemnur_uid,
      },
    });

    if (createError || !created.user) {
      return NextResponse.redirect(`${origin}/login?error=unknown`);
    }

    await admin.from("users").insert({
      id: created.user.id,
      kaemnur_uid: payload.kaemnur_uid,
      email: payload.email,
      name: payload.name,
      avatar_url: payload.avatar_url,
      license_cache: licenseCache,
      license_synced_at: new Date().toISOString(),
    });
  } else {
    email = existingUser.email as string;
    await admin
      .from("users")
      .update({
        license_cache: licenseCache,
        license_synced_at: new Date().toISOString(),
        name: payload.name,
        avatar_url: payload.avatar_url,
      })
      .eq("id", existingUser.id as string);
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${origin}/app` },
  });

  if (linkError || !linkData) {
    return NextResponse.redirect(`${origin}/login?error=unknown`);
  }

  return NextResponse.redirect(linkData.properties.action_link);
}
