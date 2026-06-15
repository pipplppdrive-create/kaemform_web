"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CreditCard, Languages, UserRound } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLicense } from "@/hooks/useLicense";
import { useToast } from "@/stores/toastStore";

const KAEMNUR_STORE_URL = `${process.env.NEXT_PUBLIC_KAEMNUR_URL ?? "https://kaemnur.com"}/store`;

export default function AccountSettingsPage() {
  const t = useTranslations("appSettings");
  const tCommon = useTranslations("common");
  const { user } = useAuth();
  const { license, trialDaysRemaining } = useLicense();
  const router = useRouter();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const licenseLabel =
    license.type === "pro" ? tCommon("pro") : license.type === "trial" ? tCommon("trial") : tCommon("free");

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/auth/sync-license", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "error");

      if (data.changed) {
        toast({ title: t("refreshSuccess"), variant: "success" });
        router.refresh();
      } else {
        toast({ title: t("refreshNoChange"), variant: "default" });
      }
    } catch {
      toast({ title: tCommon("networkError"), variant: "error" });
    } finally {
      setRefreshing(false);
    }
  };

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

          <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" loading={refreshing} onClick={handleRefresh}>
              {t("refreshLicense")}
            </Button>
            <a href={KAEMNUR_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Button type="button" size="sm">
                {tCommon("upgrade")}
              </Button>
            </a>
          </div>
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
