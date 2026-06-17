import { NextResponse } from "next/server";
import { getKaemnurAuthUrl, getKaemnurProductUrl, type KaemnurAuthMode } from "@/lib/auth/kaemnur-url";

export function GET(request: Request) {
  const url = new URL(request.url);
  const mode: KaemnurAuthMode = url.searchParams.get("mode") === "register" ? "register" : "login";
  const redirectUrl = getKaemnurProductUrl();

  return NextResponse.redirect(getKaemnurAuthUrl({ mode, redirectUrl }));
}
