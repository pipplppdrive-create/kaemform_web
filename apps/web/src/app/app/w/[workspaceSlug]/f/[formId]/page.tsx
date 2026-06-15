import { notFound } from "next/navigation";
import { hasFeature, type Form } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { BuilderView } from "@/components/form-builder/BuilderView";

export default async function FormBuilderPage({
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

  const limits = session?.license.limits;

  return (
    <BuilderView
      form={form as Form}
      workspaceSlug={workspaceSlug}
      canUseConditionalLogic={hasFeature(limits, "conditional_logic")}
      canUseSignature={hasFeature(limits, "signature")}
    />
  );
}
