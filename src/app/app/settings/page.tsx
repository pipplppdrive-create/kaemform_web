"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CreditCard, ExternalLink, Languages, RefreshCw, Timer, UserRound } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLicense } from "@/hooks/useLicense";
import { useToast } from "@/stores/toastStore";

const KAEMFORM_PRODUCT_URL = "https://www.kaemnur.com/products/KaemForm";

export default function AccountSettingsPage() {
  const t = useTranslations("appSettings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { license, trialDaysRemaining } = useLicense();
  const [licenseInput, setLicenseInput] = useState("");
  const [syncing, setSyncing] = useState(false);

  const licenseLabel =
    license.type === "pro" ? tCommon("pro") : license.type === "trial" ? tCommon("trial") : tCommon("free");
  const hasTrialStarted = Boolean(license.trial_started_at);
  const trialExpiryDate = license.expires_at ? new Date(license.expires_at).toLocaleDateString("id-ID") : null;

  const handleActivateLicense = async () => {
    const code = licenseInput.trim();
    if (!code) {
      toast({ title: t("licenseRequired"), variant: "error" });
      return;
    }

    setSyncing(true);

    try {
      const res = await fetch("/api/auth/sync-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license: code }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.changed) {
        toast({ title: t("licenseFailed"), variant: "error" });
        return;
      }

      setLicenseInput("");
      toast({ title: t("licenseActivated"), variant: "success" });
      router.refresh();
    } catch {
      toast({ title: tCommon("networkError"), variant: "error" });
    } finally {
      setSyncing(false);
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
          {license.type === "trial" && (
            <div className="rounded-input border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <Timer className="mt-0.5 h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {t("trialCountdownTitle", { days: trialDaysRemaining })}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    {t("trialCountdownDescription", { date: trialExpiryDate ?? "-" })}
                  </p>
                </div>
              </div>
            </div>
          )}
          {license.type === "free" && !hasTrialStarted && (
            <div className="rounded-input border border-primary-100 bg-primary-50 p-3 text-sm leading-6 text-primary-800">
              {t("trialStartsOnWorkspace")}
            </div>
          )}
          {license.type === "free" && hasTrialStarted && (
            <div className="rounded-input border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              {t("trialEnded")}
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

          {license.type !== "pro" && (
            <div className="rounded-input border border-border bg-white p-3">
              <Input
                label={t("licenseInputLabel")}
                placeholder={t("licenseInputPlaceholder")}
                value={licenseInput}
                onChange={(event) => setLicenseInput(event.target.value)}
                description={t("licenseInputHint")}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={syncing}
                  disabled={!licenseInput.trim()}
                  onClick={handleActivateLicense}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("activateLicense")}
                </Button>
                <Link href={KAEMFORM_PRODUCT_URL} target="_blank" rel="noopener noreferrer">
                  <Button type="button" size="sm">
                    <ExternalLink className="h-4 w-4" />
                    {t("buyLicense")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
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
