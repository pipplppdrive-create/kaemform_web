import { NextResponse } from "next/server";

/** Legacy route: Google login is owned by kaemnur.com, then bridged here. */
export async function GET() {
  const kaemnurUrl = process.env.NEXT_PUBLIC_KAEMNUR_URL ?? "https://kaemnur.com";
  return NextResponse.redirect(
    `${kaemnurUrl.replace(/\/$/, "")}/api/products/kaemform/web-login`
  );
}
