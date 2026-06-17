"use client";

import { useTranslations } from "next-intl";
import { CreditCard, Languages, UserRound } from "lucide-react";
import { Badge, Card, CardContent, CardHeader } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLicense } from "@/hooks/useLicense";

export default function AccountSettingsPage() {
  const t = useTranslations("appSettings");
  const tCommon = useTranslations("common");
  const { user } = useAuth();
  const { license, trialDaysRemaining } = useLicense();

  const licenseLabel =
    license.type === "pro" ? tCommon("pro") : license.type === "trial" ? tCommon("trial") : tCommon("free");

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <p className="text-sm font-semibold text-primary-600">{tCommon("appName")}</p>
        <h1 className="page-heading mt-1">{t("title")}</h1>
        <p className="page-subtitle">Kelola profil, lisensi, dan preferensi aplikasi.</p>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-primary-600" />
          <h2 className="text-sm font-bold text-slate-900">{t("profileTitle")}</h2>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 ring-4 ring-primary-50">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name ?? user.email}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary-600" />
          <h2 className="text-sm font-bold text-slate-900">{t("licenseTitle")}</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{t("licenseTypeLabel")}</span>
            <Badge variant={license.type}>{licenseLabel}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{t("licenseExpiryLabel")}</span>
            <span className="text-sm text-gray-900">
              {license.expires_at ? new Date(license.expires_at).toLocaleDateString("id-ID") : t("noExpiry")}
            </span>
          </div>
          {license.type === "trial" && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{tCommon("trial")}</span>
              <span className="text-sm text-gray-900">{t("trialDaysRemaining", { days: trialDaysRemaining })}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{t("storageAddonLabel")}</span>
            <span className="text-sm text-gray-900">
              {license.storage_addon
                ? t("storageAddonValue", { days: license.storage_addon.retention_days })
                : t("storageAddonNone")}
            </span>
          </div>

          <p className="mt-2 rounded-input bg-slate-50 p-3 text-sm leading-6 text-slate-500">
            {t("licenseStandaloneNote")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary-600" />
          <h2 className="text-sm font-bold text-slate-900">{t("languageTitle")}</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{t("languageNote")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
