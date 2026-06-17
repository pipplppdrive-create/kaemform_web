import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, UserPlus } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";

const KNOWN_ERRORS = [
  "invalid_token",
  "not_registered",
  "invalid_credentials",
  "email_in_use",
  "weak_password",
  "provider_disabled",
  "bridge_unconfigured",
  "account_conflict",
  "unknown",
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const t = await getTranslations("auth");

  const errorKey = KNOWN_ERRORS.includes(error as (typeof KNOWN_ERRORS)[number])
    ? (error as (typeof KNOWN_ERRORS)[number])
    : null;

  return (
    <main className="brand-wash flex min-h-screen items-center justify-center p-4 py-10">
      <div className="w-full max-w-md rounded-[20px] border border-white/80 bg-white p-6 shadow-form sm:p-8">
        <div className="mb-7 flex justify-center">
          <BrandLogo attribution="App by kaemnur" />
        </div>
        {errorKey && (
          <div className="mb-5 rounded-input border border-error/30 bg-red-50 p-3 text-sm font-medium text-error">
            {t(`errors.${errorKey}`)}
          </div>
        )}
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t("loginTitle")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t("loginSubtitle")}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth/kaemnur"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-input bg-primary-600 px-6 text-base font-semibold text-white shadow-button transition-all duration-150 ease-out hover:-translate-y-px hover:bg-primary-700 hover:shadow-lg"
            >
              {t("loginWithKaemnur")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/kaemnur?mode=register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-input border border-primary-200 bg-white px-6 text-base font-semibold text-primary-700 shadow-sm transition-all duration-150 ease-out hover:-translate-y-px hover:border-primary-300 hover:bg-primary-50"
            >
              <UserPlus className="h-4 w-4" />
              {t("registerWithKaemnur")}
            </Link>
          </div>

          <p className="text-center text-xs leading-5 text-slate-500">{t("kaemnurInfo")}</p>
        </div>
      </div>
    </main>
  );
}
