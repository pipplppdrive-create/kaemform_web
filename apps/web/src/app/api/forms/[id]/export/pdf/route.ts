import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { hasFeature, type FormField, type FormResponse } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { renderResponsesPdf } from "@/lib/pdf/render";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!hasFeature(session.license.limits, "export_pdf")) {
    return NextResponse.json({ error: "pro_required" }, { status: 403 });
  }

  if (!checkRateLimit(`export-pdf:${session.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("title, slug, schema")
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

  const t = await getTranslations();

  const buffer = await renderResponsesPdf({
    title: form.title as string,
    exportedAt: new Date().toLocaleString("id-ID"),
    fields: form.schema as FormField[],
    responses: (responses ?? []) as FormResponse[],
    labels: {
      exportedAtLabel: t("responses.exportedAt"),
      dateLabel: t("common.date"),
      signatureLabel: `[${t("fieldTypes.signature")}]`,
      pageOf: (page, total) => `${t("common.page")} ${page} ${t("common.of")} ${total}`,
    },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${form.slug}-responses.pdf"`,
    },
  });
}
