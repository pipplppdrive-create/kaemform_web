import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CircleAlert } from "lucide-react";
import { hasFeature, type Form, type FormSettings, type LicenseCache } from "@kaemform/shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { resolveEffectiveLicense } from "@/lib/auth/license";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function InfoCard({ title, description }: { title: string; description?: string }) {
  return (
    <main className="brand-wash flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-[480px] rounded-[18px] border border-white/80 bg-white p-8 text-center shadow-form">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700 ring-8 ring-primary-50">
          <CircleAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
    </main>
  );
}

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("publicForm");
  const admin = createAdminClient();

  const { data: form } = await admin
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (!form || (form.status !== "published" && form.status !== "closed")) {
    return <InfoCard title={t("notFound")} />;
  }

  const settings = form.settings as FormSettings;

  if (form.status === "closed") {
    return <InfoCard title={t("closedTitle")} description={settings.custom_close_message || t("closedDescription")} />;
  }

  if (settings.limit_responses !== null && settings.limit_responses !== undefined && form.response_count >= settings.limit_responses) {
    return <InfoCard title={t("fullTitle")} description={t("fullDescription")} />;
  }

  if (settings.require_login) {
    const session = await getSessionUser();
    if (!session) {
      return <InfoCard title={t("loginRequiredTitle")} description={t("loginRequiredDescription")} />;
    }
  }

  let hideBranding = false;
  const { data: workspace } = await admin
    .from("workspaces")
    .select("owner_id")
    .eq("id", form.workspace_id as string)
    .maybeSingle();

  if (workspace) {
    const { data: owner } = await admin
      .from("users")
      .select("license_cache")
      .eq("id", workspace.owner_id as string)
      .maybeSingle();

    if (owner) {
      const license = resolveEffectiveLicense(owner.license_cache as LicenseCache | null);
      hideBranding = hasFeature(license.limits, "remove_branding") && settings.remove_branding === true;
    }
  }

  return (
    <main className="brand-wash min-h-screen">
      <FormRenderer form={form as Form} formSlug={slug} hideBranding={hideBranding} />
    </main>
  );
}
