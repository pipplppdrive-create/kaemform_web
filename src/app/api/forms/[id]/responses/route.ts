import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

const DEFAULT_LIMIT = 20;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!form) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.max(1, Number(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT)) || DEFAULT_LIMIT);
  const search = url.searchParams.get("search")?.trim();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("responses")
    .select("*", { count: "exact" })
    .eq("form_id", id)
    .is("deleted_at", null)
    .order("submitted_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.filter("data::text", "ilike", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    data: data ?? [],
    total,
    hasMore: from + (data?.length ?? 0) < total,
  });
}
