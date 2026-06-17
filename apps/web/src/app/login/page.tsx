import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";
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
          <BrandLogo />
        </div>
        {errorKey && (
          <div className="mb-5 rounded-input border border-error/30 bg-red-50 p-3 text-sm font-medium text-error">
            {t(`errors.${errorKey}`)}
          </div>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
