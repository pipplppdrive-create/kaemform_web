"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLicense } from "@/hooks/useLicense";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { KaemnurAttribution } from "@/components/shared/KaemnurAttribution";
import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";

export function AppHeader() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const { license, trialDaysRemaining } = useLicense();

  const licenseLabel =
    license.type === "pro" ? t("common.pro") : license.type === "trial" ? t("common.trial") : t("common.free");

  const trialExpired = license.type === "free" && !!license.trial_started_at;
  const displayName = user.name ?? user.email;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 shadow-sm backdrop-blur">
        <div className="brand-accent h-[3px]" />
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/app" aria-label={t("common.appName")} className="shrink-0">
              <BrandLogo />
            </Link>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <KaemnurAttribution className="hidden sm:inline-flex" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant={license.type}>{licenseLabel}</Badge>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-input px-1.5 py-1 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-100">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-100"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 ring-2 ring-primary-50">
                    {initial}
                  </span>
                )}
                <span className="hidden max-w-[160px] truncate font-medium sm:block">{displayName}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings" className="flex w-full items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {t("nav.accountSettings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="danger" onSelect={() => logout()}>
                  <LogOut className="h-4 w-4" />
                  {t("common.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {(license.type === "trial" || trialExpired) && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-[13px] text-amber-800">
          <span>
            {license.type === "trial"
              ? t("upgrade.trialBanner", { days: trialDaysRemaining })
              : t("upgrade.trialExpired")}
          </span>
          <span className="font-medium text-primary-600">{t("common.upgrade")}</span>
        </div>
      )}
    </>
  );
}
