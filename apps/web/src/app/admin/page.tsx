import { getTranslations } from "next-intl/server";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { BrandLogo } from "@/components/shared/BrandLogo";

export default async function AdminPage() {
  const t = await getTranslations("auth");

  return (
    <main className="brand-wash flex min-h-screen items-center justify-center p-4 py-10">
      <div className="w-full max-w-md rounded-[20px] border border-white/80 bg-white p-6 shadow-form sm:p-8">
        <div className="mb-7 flex justify-center">
          <BrandLogo />
        </div>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("adminLoginTitle")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{t("adminLoginSubtitle")}</p>
        </div>
        <AdminLoginForm />
        <p className="mt-5 text-center text-xs leading-5 text-slate-500">{t("adminManualInfo")}</p>
      </div>
    </main>
  );
}
