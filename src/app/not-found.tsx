import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SearchX } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <main className="brand-wash flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[18px] border border-white/80 bg-white p-8 text-center shadow-form">
        <BrandLogo className="justify-center" />
        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-8 ring-primary-50/60">
          <SearchX className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-slate-900">{t("errors.notFound")}</h1>
        <Link href="/app" className="mt-6 block">
          <Button className="w-full">{t("common.back")}</Button>
        </Link>
      </div>
    </main>
  );
}
