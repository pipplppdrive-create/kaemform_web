"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, Copy, Eye, EyeOff, QrCode, Settings } from "lucide-react";
import type { FormStatus } from "@kaemform/shared";
import { Badge, Button } from "@/components/ui";

export interface BuilderTopbarProps {
  workspaceSlug: string;
  status: FormStatus;
  title: string;
  onTitleChange: (title: string) => void;
  onTitleBlur: (title: string) => void;
  previewMode: boolean;
  onTogglePreview: () => void;
  onPublish: () => void;
  onClose: () => void;
  onReopen: () => void;
  onShowQrCode: () => void;
  onOpenFormSettings: () => void;
  formUrl: string;
  isDirty: boolean;
  isSaving: boolean;
}

export function BuilderTopbar({
  workspaceSlug,
  status,
  title,
  onTitleChange,
  onTitleBlur,
  previewMode,
  onTogglePreview,
  onPublish,
  onClose,
  onReopen,
  onShowQrCode,
  onOpenFormSettings,
  formUrl,
  isDirty,
  isSaving,
}: BuilderTopbarProps) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 shadow-sm sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          href={`/app/w/${workspaceSlug}`}
          className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-slate-500 transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("builder.back")}
        </Link>

        {previewMode ? (
          <span className="truncate text-base font-bold text-slate-900">{title}</span>
        ) : (
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={(e) => onTitleBlur(e.target.value)}
            className="min-w-0 max-w-xs truncate rounded-input border border-transparent bg-transparent px-2 py-1 text-base font-bold text-slate-900 transition-colors hover:bg-slate-50 focus:border-primary-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
          />
        )}

        <Badge variant={status}>{t(`common.${status}`)}</Badge>
      </div>

      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {!previewMode && (
          <span className="hidden items-center gap-1 text-xs font-medium text-emerald-600 sm:flex">
            {isSaving ? t("common.saving") : !isDirty ? t("common.savedCheck") : ""}
          </span>
        )}

        {!previewMode && status === "published" && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label={t("formSettings.copyLink")}
            onClick={handleCopyLink}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t("common.copied") : t("formSettings.copyLink")}
          </Button>
        )}

        {!previewMode && status === "published" && (
          <Button type="button" variant="secondary" size="sm" aria-label={t("form.menu.qrCode")} onClick={onShowQrCode}>
            <QrCode className="h-4 w-4" />
          </Button>
        )}

        {!previewMode && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label={t("builder.formSettings.shortTitle")}
            onClick={onOpenFormSettings}
          >
            <Settings className="h-4 w-4" />
            {t("builder.formSettings.shortTitle")}
          </Button>
        )}

        <Button type="button" variant="secondary" size="sm" onClick={onTogglePreview}>
          {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {previewMode ? t("builder.backToEditor") : t("builder.preview")}
        </Button>

        {!previewMode && status === "draft" && (
          <Button type="button" size="sm" onClick={onPublish}>
            {t("builder.publish")}
          </Button>
        )}

        {!previewMode && status === "published" && (
          <Button type="button" variant="danger" size="sm" onClick={onClose}>
            {t("builder.close")}
          </Button>
        )}

        {!previewMode && status === "closed" && (
          <Button type="button" size="sm" onClick={onReopen}>
            {t("builder.reopen")}
          </Button>
        )}
      </div>
    </header>
  );
}
