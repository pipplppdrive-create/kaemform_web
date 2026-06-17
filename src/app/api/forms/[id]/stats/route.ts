import { NextResponse } from "next/server";
import type { ResponseStats } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

const PER_DAY_WINDOW = 30;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 6);

  const windowStart = new Date(startOfToday);
  windowStart.setUTCDate(windowStart.getUTCDate() - (PER_DAY_WINDOW - 1));

  const { count: total } = await supabase
    .from("responses")
    .select("id", { count: "exact", head: true })
    .eq("form_id", id)
    .is("deleted_at", null);

  const { data: rows } = await supabase
    .from("responses")
    .select("submitted_at")
    .eq("form_id", id)
    .is("deleted_at", null)
    .gte("submitted_at", windowStart.toISOString());

  const perDayMap = new Map<string, number>();
  for (let i = 0; i < PER_DAY_WINDOW; i++) {
    const day = new Date(windowStart);
    day.setUTCDate(day.getUTCDate() + i);
    perDayMap.set(dateKey(day), 0);
  }

  let today = 0;
  let thisWeek = 0;

  for (const row of rows ?? []) {
    const submittedAt = new Date(row.submitted_at as string);
    const key = dateKey(submittedAt);
    if (perDayMap.has(key)) {
      perDayMap.set(key, (perDayMap.get(key) ?? 0) + 1);
    }
    if (submittedAt >= startOfToday) today++;
    if (submittedAt >= startOfWeek) thisWeek++;
  }

  const stats: ResponseStats = {
    total: total ?? 0,
    today,
    thisWeek,
    perDay: Array.from(perDayMap.entries()).map(([date, count]) => ({ date, count })),
  };

  return NextResponse.json({ stats });
}
