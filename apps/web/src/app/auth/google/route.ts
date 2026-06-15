import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Initiate Google OAuth (Auth Bridge Path 2 — Direct Google OAuth). */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/google/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=unknown`);
  }

  return NextResponse.redirect(data.url);
}
