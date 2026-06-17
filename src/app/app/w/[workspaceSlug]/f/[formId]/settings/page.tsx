import { notFound } from "next/navigation";
import { hasFeature, type Form } from "@kaemform/shared";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { FormSettingsView } from "@/components/form-settings/FormSettingsView";

export default async function FormSettingsPage({
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
    <FormSettingsView
      form={form as Form}
      workspaceSlug={workspaceSlug}
      canCustomSlug={hasFeature(limits, "custom_slug")}
      canRemoveBranding={hasFeature(limits, "remove_branding")}
      canEmailNotification={hasFeature(limits, "email_notification")}
    />
  );
}
