import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getManualAdminLicenseCache } from "@/lib/auth/license";

const DEFAULT_ADMIN_USERNAME = "kaemnur";
const DEFAULT_ADMIN_PASSWORD_HASH =
  "7dac6ba180909671bde51b921203d302a5c83293a56a06300ecd1455f6843c92";
const DEFAULT_ADMIN_EMAIL = "kaemnur-admin@kaemform.local";
const DEFAULT_ADMIN_KAEMNUR_UID = "00000000-0000-4000-8000-000000000095";
const DEFAULT_ADMIN_NAME = "Kaemnur";

function hashSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqualHex(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function getExpectedPasswordHash(): string {
  const configuredHash = process.env.KAEMFORM_ADMIN_PASSWORD_SHA256?.trim();
  if (configuredHash && /^[a-f0-9]{64}$/i.test(configuredHash)) {
    return configuredHash.toLowerCase();
  }

  const configuredPassword = process.env.KAEMFORM_ADMIN_PASSWORD;
  if (configuredPassword) {
    return hashSecret(configuredPassword);
  }

  return DEFAULT_ADMIN_PASSWORD_HASH;
}

async function generateMagicLink(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  metadata: Record<string, unknown>
) {
  const link = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { data: metadata },
  });

  if (!link.error) {
    return link;
  }

  const message = link.error.message.toLowerCase();
  if (!message.includes("not found")) {
    return link;
  }

  await admin.auth.admin.createUser({
    email,
    password: `${randomUUID()}${randomUUID()}`,
    email_confirm: true,
    user_metadata: metadata,
  });

  return admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { data: metadata },
  });
}

export async function POST(request: Request) {
  let payload: { username?: unknown; password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const username = typeof payload.username === "string" ? payload.username.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const expectedUsername = process.env.KAEMFORM_ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME;

  if (
    username !== expectedUsername ||
    !safeEqualHex(hashSecret(password), getExpectedPasswordHash())
  ) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const admin = createAdminClient();
  const email = process.env.KAEMFORM_ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const kaemnurUid = process.env.KAEMFORM_ADMIN_KAEMNUR_UID ?? DEFAULT_ADMIN_KAEMNUR_UID;
  const name = process.env.KAEMFORM_ADMIN_NAME ?? DEFAULT_ADMIN_NAME;
  const metadata = {
    name,
    kaemnur_uid: kaemnurUid,
    is_manual_admin: true,
  };

  const linkData = await generateMagicLink(admin, email, metadata);
  if (linkData.error || !linkData.data?.user || !linkData.data.properties.hashed_token) {
    return NextResponse.json({ error: "session_failed" }, { status: 500 });
  }

  const authUserId = linkData.data.user.id;
  const licenseCache = getManualAdminLicenseCache();
  const { error: profileError } = await admin.from("users").upsert(
    {
      id: authUserId,
      kaemnur_uid: kaemnurUid,
      email,
      name,
      avatar_url: null,
      license_cache: licenseCache,
      license_synced_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return NextResponse.json({ error: "profile_failed" }, { status: 500 });
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(authUserId, {
    user_metadata: {
      ...linkData.data.user.user_metadata,
      ...metadata,
    },
  });

  if (metadataError) {
    return NextResponse.json({ error: "profile_failed" }, { status: 500 });
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.verifyOtp({
    token_hash: linkData.data.properties.hashed_token,
    type: "magiclink",
  });

  if (sessionError) {
    return NextResponse.json({ error: "session_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, redirectTo: "/app" });
}
