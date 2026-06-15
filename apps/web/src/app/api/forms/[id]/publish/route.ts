import { NextResponse } from "next/server";
import type { FormSchema } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: form, error: fetchError } = await supabase
    .from("forms")
    .select("id, schema, status")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!form) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const schema = form.schema as FormSchema;
  if (!Array.isArray(schema) || schema.length === 0) {
    return NextResponse.json({ error: "form_empty" }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("forms")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ form: updated });
}
