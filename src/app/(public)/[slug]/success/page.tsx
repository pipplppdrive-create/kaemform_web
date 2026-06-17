import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import type { FormSettings } from "@kaemform/shared";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicFormSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("publicForm");
  const admin = createAdminClient();

  const { data: form } = await admin
    .from("forms")
    .select("status, settings")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  const settings = form?.settings as FormSettings | undefined;
  const message = settings?.success_message || t("successDefault");

  return (
    <main className="brand-wash flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-[480px] rounded-[18px] border border-white/80 bg-white p-8 text-center shadow-form">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">{t("successTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        {form?.status === "published" && (
          <Link href={`/${slug}`} className="mt-6 inline-block rounded-input bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100">
            {t("submitAnother")}
          </Link>
        )}
      </div>
    </main>
  );
}
