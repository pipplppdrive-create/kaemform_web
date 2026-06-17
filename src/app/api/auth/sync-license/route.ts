import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { resolveEffectiveLicense } from "@/lib/auth/license";
import { syncLicense } from "@/lib/auth/license-sync";

export async function POST() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: user } = await admin
    .from("users")
    .select("kaemnur_uid")
    .eq("id", session.id)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const cache = await syncLicense(session.id, user.kaemnur_uid as string);

  if (!cache) {
    return NextResponse.json({ changed: false });
  }

  return NextResponse.json({ changed: true, license: resolveEffectiveLicense(cache) });
}
