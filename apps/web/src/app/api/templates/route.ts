import { NextResponse } from "next/server";
import { FREE_TEMPLATE_CATEGORIES, hasFeature, saveTemplateSchema } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? "system";

  const supabase = await createClient();
  let query = supabase.from("form_templates").select("*");

  if (filter === "mine") {
    query = query.eq("created_by", session.id);
  } else {
    query = query.eq("is_system", true);

    if (!hasFeature(session.license.limits, "all_templates")) {
      query = query.in("category", FREE_TEMPLATE_CATEGORIES);
    }
  }

  const { data: templates, error } = await query.order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ templates: templates ?? [] });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = saveTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { form_id, title, description } = parsed.data;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("schema, settings")
    .eq("id", form_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!form) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: created, error } = await supabase
    .from("form_templates")
    .insert({
      title,
      description: description ?? null,
      category: "umum",
      schema: form.schema,
      settings: form.settings,
      is_system: false,
      created_by: session.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: created }, { status: 201 });
}
