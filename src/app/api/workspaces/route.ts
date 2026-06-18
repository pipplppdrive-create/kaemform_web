import { NextResponse } from "next/server";
import { createWorkspaceSchema } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { startWorkspaceTrialIfEligible } from "@/lib/auth/trial";
import { getWorkspacesWithStats } from "@/lib/data/workspaces";
import { generateWorkspaceSlug } from "@/lib/slug";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const workspaces = await getWorkspacesWithStats(supabase);

  return NextResponse.json({ workspaces });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { count: workspaceCount } = await supabase
    .from("workspaces")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", session.id)
    .is("deleted_at", null);

  const limit = session.license.limits.max_workspaces;
  if (limit !== -1 && (workspaceCount ?? 0) >= limit) {
    return NextResponse.json({ error: "tier_limit_workspaces" }, { status: 403 });
  }

  const slug = generateWorkspaceSlug(parsed.data.name);

  const { data: created, error } = await supabase
    .from("workspaces")
    .insert({ owner_id: session.id, name: parsed.data.name, slug })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await startWorkspaceTrialIfEligible(session.id).catch(() => null);

  return NextResponse.json({ workspace: created }, { status: 201 });
}
