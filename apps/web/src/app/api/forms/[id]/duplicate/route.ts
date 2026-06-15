import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { generateFormSlug } from "@/lib/slug";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: original, error: fetchError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!original) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { count: formCount } = await supabase
    .from("forms")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", original.workspace_id as string)
    .is("deleted_at", null);

  const limit = session.license.limits.max_forms_per_workspace;
  if (limit !== -1 && (formCount ?? 0) >= limit) {
    return NextResponse.json({ error: "tier_limit_forms" }, { status: 403 });
  }

  const { data: created, error } = await supabase
    .from("forms")
    .insert({
      workspace_id: original.workspace_id,
      title: `${original.title as string} (Copy)`,
      description: original.description,
      slug: generateFormSlug(),
      schema: original.schema,
      settings: original.settings,
      status: "draft",
      response_count: 0,
      created_by: session.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ form: created }, { status: 201 });
}
