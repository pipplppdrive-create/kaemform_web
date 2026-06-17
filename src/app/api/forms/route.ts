import { NextResponse } from "next/server";
import {
  createFormSchema,
  DEFAULT_FORM_SETTINGS,
  type FormSchema,
  type FormSettings,
} from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { generateFormSlug } from "@/lib/slug";
import {
  cloneTemplateSchema,
  cloneTemplateSettings,
  getStaticSystemTemplate,
} from "@/lib/templates/system-templates";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { workspace_id, title, template_id } = parsed.data;
  const supabase = await createClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspace_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!workspace) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { count: formCount } = await supabase
    .from("forms")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace_id)
    .is("deleted_at", null);

  const limit = session.license.limits.max_forms_per_workspace;
  if (limit !== -1 && (formCount ?? 0) >= limit) {
    return NextResponse.json({ error: "tier_limit_forms" }, { status: 403 });
  }

  let schema: FormSchema = [];
  let settings: FormSettings = {
    ...DEFAULT_FORM_SETTINGS,
    retention_days: session.license.limits.retention_days,
  };

  if (template_id) {
    const staticTemplate = getStaticSystemTemplate(template_id);

    if (staticTemplate) {
      schema = cloneTemplateSchema(staticTemplate.schema);
      settings = { ...settings, ...cloneTemplateSettings(staticTemplate.settings) };
    } else {
      const { data: template } = await supabase
        .from("form_templates")
        .select("schema, settings")
        .eq("id", template_id)
        .maybeSingle();

      if (!template) {
        return NextResponse.json({ error: "template_not_found" }, { status: 404 });
      }

      schema = template.schema as FormSchema;
      settings = { ...settings, ...(template.settings as Partial<FormSettings>) };
    }
  }

  const slug = generateFormSlug();

  const { data: created, error } = await supabase
    .from("forms")
    .insert({
      workspace_id,
      title,
      slug,
      schema,
      settings,
      status: "draft",
      created_by: session.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ form: created }, { status: 201 });
}
