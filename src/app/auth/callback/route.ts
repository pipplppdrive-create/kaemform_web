import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { TIER_LIMITS, type LaunchTokenPayload, type LicenseCache } from "@kaemform/shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function redirectWithError(origin: string, error: string) {
  return NextResponse.redirect(`${origin}/login?error=${error}`);
}

function getDesktopRedirect(value: string | null): URL | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol === "kaemform:" && url.hostname === "auth" && url.pathname === "/callback") {
      return url;
    }
  } catch {
    return null;
  }

  return null;
}

function isLaunchTokenPayload(value: unknown): value is LaunchTokenPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Partial<LaunchTokenPayload>;
  const license = payload.license;
  return Boolean(
    payload.kaemnur_uid &&
      payload.email &&
      payload.name &&
      license &&
      ["free", "trial", "pro"].includes(license.type) &&
      license.storage_addon &&
      typeof license.storage_addon.retention_days === "number"
  );
}

/**
 * Launch Token callback (Auth Bridge Path 1 — Kaemnur → KaemForm).
 * Requires LAUNCH_TOKEN_SECRET to be configured (Kaemnur bridge revision).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const origin = url.origin;
  const secret = process.env.LAUNCH_TOKEN_SECRET;
  const desktopRedirect = getDesktopRedirect(url.searchParams.get("redirect_to"));

  if (!secret) {
    return redirectWithError(origin, "bridge_unconfigured");
  }
  if (!token) {
    return redirectWithError(origin, "invalid_token");
  }

  let payload: LaunchTokenPayload;
  try {
    const { payload: verified } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    if (!isLaunchTokenPayload(verified)) {
      throw new Error("Invalid payload");
    }
    payload = verified;
  } catch {
    return redirectWithError(origin, "invalid_token");
  }

  const admin = createAdminClient();
  const licenseCache: LicenseCache = {
    type: payload.license.type,
    expires_at: payload.license.expires_at,
    storage_addon: payload.license.storage_addon,
    limits: TIER_LIMITS[payload.license.type],
  };

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: payload.email,
    options: {
      data: {
        name: payload.name,
        avatar_url: payload.avatar_url,
        kaemnur_uid: payload.kaemnur_uid,
      },
    },
  });

  if (linkError || !linkData?.user || !linkData.properties.hashed_token) {
    return redirectWithError(origin, "unknown");
  }

  const { data: userByKaemnurId } = await admin
    .from("users")
    .select("*")
    .eq("kaemnur_uid", payload.kaemnur_uid)
    .maybeSingle();

  const { data: userByEmail } = userByKaemnurId
    ? { data: null }
    : await admin.from("users").select("*").eq("email", payload.email).maybeSingle();

  const existingUser = userByKaemnurId ?? userByEmail;
  const authUserId = linkData.user.id;

  if (existingUser && existingUser.id !== authUserId) {
    return redirectWithError(origin, "account_conflict");
  }

  const userRecord = {
    kaemnur_uid: payload.kaemnur_uid,
    email: payload.email,
    name: payload.name,
    avatar_url: payload.avatar_url,
    license_cache: licenseCache,
    license_synced_at: new Date().toISOString(),
  };

  const { error: profileError } = existingUser
    ? await admin.from("users").update(userRecord).eq("id", authUserId)
    : await admin.from("users").insert({ id: authUserId, ...userRecord });

  if (profileError) {
    return redirectWithError(origin, "unknown");
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(authUserId, {
    user_metadata: {
      ...linkData.user.user_metadata,
      name: payload.name,
      avatar_url: payload.avatar_url,
      kaemnur_uid: payload.kaemnur_uid,
    },
  });

  if (metadataError) {
    return redirectWithError(origin, "unknown");
  }

  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
  });

  if (sessionError) {
    return redirectWithError(origin, "unknown");
  }

  if (desktopRedirect && sessionData.session) {
    desktopRedirect.searchParams.set("access_token", sessionData.session.access_token);
    desktopRedirect.searchParams.set("refresh_token", sessionData.session.refresh_token);
    desktopRedirect.searchParams.set("expires_at", String(sessionData.session.expires_at ?? ""));
    desktopRedirect.searchParams.set("token_type", sessionData.session.token_type);
    return NextResponse.redirect(desktopRedirect);
  }

  return NextResponse.redirect(`${origin}/app`);
}
