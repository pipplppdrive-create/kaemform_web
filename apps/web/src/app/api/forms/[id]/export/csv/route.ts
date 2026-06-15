import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import type { FormField, FormResponse, ResponseData } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { getExportFields, formatFieldValue } from "@/lib/export/response-format";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(`export-csv:${session.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("slug, schema")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!form) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: responses } = await supabase
    .from("responses")
    .select("*")
    .eq("form_id", id)
    .is("deleted_at", null)
    .order("submitted_at", { ascending: false });

  const fields = getExportFields(form.schema as FormField[]);
  const t = await getTranslations();
  const signatureLabel = `[${t("fieldTypes.signature")}]`;

  const header = [t("common.date"), ...fields.map((field) => field.label)];
  const lines = [header.map(csvEscape).join(",")];

  for (const response of (responses ?? []) as FormResponse[]) {
    const data = response.data as ResponseData;
    const row = [
      new Date(response.submitted_at).toISOString(),
      ...fields.map((field) => formatFieldValue(field, data[field.id], signatureLabel)),
    ];
    lines.push(row.map(csvEscape).join(","));
  }

  const csv = "﻿" + lines.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${form.slug}-responses.csv"`,
    },
  });
}
