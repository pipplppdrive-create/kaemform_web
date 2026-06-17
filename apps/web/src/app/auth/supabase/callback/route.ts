import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  const redirectTo = next.startsWith("/") ? next : "/app";

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=invalid_token`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${url.origin}/login?error=invalid_token`);
  }

  return NextResponse.redirect(`${url.origin}${redirectTo}`);
}
