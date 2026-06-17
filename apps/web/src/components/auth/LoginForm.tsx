"use client";

import { useTranslations } from "next-intl";

export function LoginForm({ kaemnurUrl }: { kaemnurUrl: string }) {
  const t = useTranslations("auth");
  const kaemnurBaseUrl = kaemnurUrl.replace(/\/$/, "");
  const kaemnurProductUrl = `${kaemnurBaseUrl}/products/kaemform`;
  const kaemnurLoginUrl = `${kaemnurBaseUrl}/api/products/kaemform/web-login`;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t("loginTitle")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {t("loginSubtitle")}
        </p>
      </div>

      <a
        href={kaemnurLoginUrl}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-input border border-border bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-px hover:border-primary-200 hover:bg-primary-50"
      >
        {t("continueWithGoogle")}
      </a>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-border" />
        {t("or")}
        <div className="h-px flex-1 bg-border" />
      </div>

      <a
        href={kaemnurProductUrl}
        className="inline-flex h-11 items-center justify-center rounded-input bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-primary-700"
      >
        {t("fromKaemnur")}
      </a>

      <p className="text-center text-xs leading-5 text-slate-500">{t("kaemnurInfo")}</p>
    </div>
  );
}
