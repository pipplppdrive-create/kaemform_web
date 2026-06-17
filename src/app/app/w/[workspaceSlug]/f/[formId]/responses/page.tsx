import { notFound } from "next/navigation";
import { hasFeature, type Form } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { ResponsesView } from "@/components/responses/ResponsesView";

export default async function FormResponsesPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; formId: string }>;
}) {
  const { workspaceSlug, formId } = await params;
  const session = await getSessionUser();
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!form) {
    notFound();
  }

  const canExportPdf = hasFeature(session?.license.limits, "export_pdf");

  return <ResponsesView form={form as Form} workspaceSlug={workspaceSlug} canExportPdf={canExportPdf} />;
}
