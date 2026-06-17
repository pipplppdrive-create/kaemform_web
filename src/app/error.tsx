"use client";

import { useTranslations } from "next-intl";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui";
import { BrandLogo } from "@/components/shared/BrandLogo";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();

  return (
    <main className="brand-wash flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[18px] border border-white/80 bg-white p-8 text-center shadow-form">
        <BrandLogo className="justify-center" />
        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-error ring-8 ring-red-50/60">
          <CircleAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-slate-900">{t("errors.serverError")}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t("common.error")}</p>
        <Button className="mt-6 w-full" onClick={reset}>
          {t("common.retry")}
        </Button>
      </div>
    </main>
  );
}
