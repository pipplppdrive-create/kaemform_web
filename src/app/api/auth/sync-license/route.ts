import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { resolveEffectiveLicense } from "@/lib/auth/license";
import { activateLicenseCode } from "@/lib/auth/license-sync";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const licenseCode = typeof body.license === "string" ? body.license.trim() : "";

  if (!licenseCode) {
    return NextResponse.json({ error: "license_required" }, { status: 400 });
  }

  try {
    const cache = await activateLicenseCode(session.id, licenseCode);

    if (!cache) {
      return NextResponse.json({ error: "invalid_license" }, { status: 400 });
    }

    return NextResponse.json({ changed: true, license: resolveEffectiveLicense(cache) });
  } catch {
    return NextResponse.json({ error: "license_sync_failed" }, { status: 502 });
  }
}
