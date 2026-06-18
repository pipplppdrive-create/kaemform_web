"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, Copy, ExternalLink, QrCode } from "lucide-react";
import type { Form, FormSettings, FormStatus } from "@kaemform/shared";
import { Badge, Button, Card, CardContent, CardHeader, Input, Modal, Switch, Textarea } from "@/components/ui";
import { useToast } from "@/stores/toastStore";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { QRCodeModal } from "@/components/shared/QRCodeModal";
import { cn } from "@/lib/utils";
import { buildPublicFormUrl, getPublicAppUrl } from "@/lib/public-url";

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;
const DEFAULT_PRIMARY_COLOR = "#2563EB";

function normalizeFormSettings(settings: FormSettings): FormSettings {
  return {
    ...settings,
    section_mode: settings.section_mode ?? "single",
    theme: {
      primary_color: settings.theme?.primary_color ?? DEFAULT_PRIMARY_COLOR,
      font: settings.theme?.font ?? "default",
    },
    quiz_enabled: settings.quiz_enabled ?? false,
    randomize_questions: settings.randomize_questions ?? false,
    randomize_options: settings.randomize_options ?? false,
  };
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function ProBadgeButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("common");
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      aria-label={t("pro")}
    >
      <Badge variant="pro">{t("pro")}</Badge>
    </button>
  );
}

export function FormSettingsView({
  form,
  workspaceSlug,
  canCustomSlug,
  canRemoveBranding,
  canEmailNotification,
}: {
  form: Form;
  workspaceSlug: string;
  canCustomSlug: boolean;
  canRemoveBranding: boolean;
  canEmailNotification: boolean;
}) {
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();

  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description ?? "");
  const [slug, setSlug] = useState(form.slug);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>(form.status);
  const [settings, setSettings] = useState<FormSettings>(normalizeFormSettings(form.settings));
  const [emailsInput, setEmailsInput] = useState(settings.notification_emails.join(", "));
  const [redirectUrlInput, setRedirectUrlInput] = useState(settings.redirect_url ?? "");
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [reopenLoading, setReopenLoading] = useState(false);

  const skipFirstSave = useRef(true);
  const appUrl = getPublicAppUrl();
  const formUrl = buildPublicFormUrl(slug);
  const canEditSlug = canCustomSlug && status === "draft";

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          toast({ title: t("common.savedCheck"), variant: "success" });
        })
        .catch(() => toast({ title: t("builder.saveError"), variant: "error" }));
    }, 800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const updateSettings = (patch: Partial<FormSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleTitleBlur = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(form.title);
      return;
    }
    if (trimmed === form.title) return;
    const res = await fetch(`/api/forms/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    if (!res.ok) {
      toast({ title: t("builder.saveError"), variant: "error" });
      return;
    }
    toast({ title: t("common.savedCheck"), variant: "success" });
  };

  const handleDescriptionBlur = async () => {
    if (description === (form.description ?? "")) return;
    const res = await fetch(`/api/forms/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description || null }),
    });
    if (!res.ok) {
      toast({ title: t("builder.saveError"), variant: "error" });
      return;
    }
    toast({ title: t("common.savedCheck"), variant: "success" });
  };

  const handleSlugBlur = async () => {
    if (slug === form.slug) {
      setSlugError(null);
      return;
    }
    if (!SLUG_REGEX.test(slug)) {
      setSlugError(t("formSettings.slugHint"));
      setSlug(form.slug);
      return;
    }
    const res = await fetch(`/api/forms/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) {
      setSlug(form.slug);
      toast({ title: t("builder.saveError"), variant: "error" });
      return;
    }
    setSlugError(null);
    toast({ title: t("common.savedCheck"), variant: "success" });
    router.refresh();
  };

  const handleRedirectUrlBlur = () => {
    const trimmed = redirectUrlInput.trim();
    if (trimmed && !isValidUrl(trimmed)) {
      toast({ title: t("formSettings.redirectUrlInvalid"), variant: "error" });
      return;
    }
    if (trimmed === (settings.redirect_url ?? "")) return;
    updateSettings({ redirect_url: trimmed || null });
  };

  const handleEmailsBlur = () => {
    const emails = emailsInput
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    if (JSON.stringify(emails) === JSON.stringify(settings.notification_emails)) return;
    updateSettings({ notification_emails: emails });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = async () => {
    setCloseLoading(true);
    const res = await fetch(`/api/forms/${form.id}/close`, { method: "POST" });
    setCloseLoading(false);
    if (!res.ok) {
      toast({ title: t("common.error"), variant: "error" });
      return;
    }
    setStatus("closed");
    setCloseOpen(false);
    toast({ title: t("common.savedCheck"), variant: "success" });
  };

  const handleReopen = async () => {
    setReopenLoading(true);
    const res = await fetch(`/api/forms/${form.id}/reopen`, { method: "POST" });
    setReopenLoading(false);
    if (!res.ok) {
      toast({ title: t("common.error"), variant: "error" });
      return;
    }
    setStatus("published");
    toast({ title: t("common.savedCheck"), variant: "success" });
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const res = await fetch(`/api/forms/${form.id}`, { method: "DELETE" });
    setDeleteLoading(false);
    if (!res.ok) {
      toast({ title: t("common.error"), variant: "error" });
      return;
    }
    router.push(`/app/w/${workspaceSlug}`);
    router.refresh();
  };

  return (
    <div className="flex min-h-[calc(100dvh-59px)] flex-col bg-slate-50">
      <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-4 shadow-sm sm:px-6">
        <Link
          href={`/app/w/${workspaceSlug}/f/${form.id}`}
          className="rounded-input p-2 text-slate-400 transition-colors hover:bg-primary-50 hover:text-primary-700"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{title || t("form.untitledForm")}</h1>
          <p className="text-sm text-slate-500">{t("formSettings.title")}</p>
        </div>
        <Badge variant={status} className="ml-auto">
          {t(`common.${status}`)}
        </Badge>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* General */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-bold text-slate-900">{t("settings.general")}</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              label={t("common.title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              maxLength={200}
            />
            <Textarea
              label={t("common.description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
            />
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{t("formSettings.urlLabel")}</label>
                {!canCustomSlug && <ProBadgeButton onClick={() => setUpgradeOpen(true)} />}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <span className="shrink-0 pt-3 text-sm text-slate-400">{appUrl}/</span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  onBlur={handleSlugBlur}
                  disabled={!canEditSlug}
                  error={slugError ?? undefined}
                  className="flex-1"
                />
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? t("common.copied") : t("formSettings.copyLink")}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" aria-label={t("qrCode.title")} onClick={() => setQrOpen(true)}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <a href={formUrl} target="_blank" rel="noopener noreferrer">
                    <Button type="button" variant="ghost" size="sm" aria-label={t("common.view")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
              {!canEditSlug && (
                <p className="mt-1.5 text-xs text-gray-400">
                  {canCustomSlug ? t("formSettings.slugHint") : t("formSettings.slugProHint")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-bold text-slate-900">{t("settings.preferences")}</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea
              label={t("formSettings.successMessageLabel")}
              value={settings.success_message}
              onChange={(e) => updateSettings({ success_message: e.target.value })}
            />
            <Input
              label={t("formSettings.redirectUrlLabel")}
              placeholder={t("formSettings.redirectUrlPlaceholder")}
              value={redirectUrlInput}
              onChange={(e) => setRedirectUrlInput(e.target.value)}
              onBlur={handleRedirectUrlBlur}
            />
            <Input
              type="number"
              min={1}
              label={t("formSettings.limitResponsesLabel")}
              description={t("formSettings.limitResponsesHint")}
              value={settings.limit_responses ?? ""}
              onChange={(e) =>
                updateSettings({ limit_responses: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
            <Switch
              label={t("formSettings.oneResponsePerIpLabel")}
              checked={settings.one_response_per_ip}
              onCheckedChange={(checked) => updateSettings({ one_response_per_ip: checked })}
            />
            <Switch
              label={t("formSettings.requireLoginLabel")}
              checked={settings.require_login}
              onCheckedChange={(checked) => updateSettings({ require_login: checked })}
            />
            <Switch
              label={t("formSettings.showProgressBarLabel")}
              checked={settings.show_progress_bar}
              onCheckedChange={(checked) => updateSettings({ show_progress_bar: checked })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("formSettings.sectionModeLabel")}
              </label>
              <div className="grid grid-cols-2 rounded-input bg-slate-100 p-1">
                {(["single", "paged"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateSettings({ section_mode: mode })}
                    className={`h-9 rounded-input text-sm font-semibold transition ${
                      settings.section_mode === mode
                        ? "bg-white text-primary-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t(`formSettings.sectionModes.${mode}`)}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                {t(`formSettings.sectionModeHints.${settings.section_mode}`)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Retention */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-bold text-slate-900">{t("settings.retention")}</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-gray-600">{t("formSettings.retentionInfo", { days: settings.retention_days })}</p>
            <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => setUpgradeOpen(true)}>
              {t("formSettings.extendRetention")}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">{t("settings.appearance")}</h2>
            {!canRemoveBranding && <ProBadgeButton onClick={() => setUpgradeOpen(true)} />}
          </CardHeader>
          <CardContent
            className={cn("flex flex-col gap-4", !canRemoveBranding && "pointer-events-none opacity-50")}
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("formSettings.primaryColorLabel")}
              </label>
              <input
                type="color"
                value={settings.theme.primary_color}
                onChange={(e) => updateSettings({ theme: { ...settings.theme, primary_color: e.target.value } })}
                disabled={!canRemoveBranding}
                className="h-10 w-20 cursor-pointer rounded-input border border-border bg-white p-1 disabled:cursor-not-allowed"
              />
            </div>
            <Switch
              label={t("formSettings.removeBrandingLabel")}
              checked={settings.remove_branding}
              onCheckedChange={(checked) => updateSettings({ remove_branding: checked })}
              disabled={!canRemoveBranding}
            />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">{t("settings.notifications")}</h2>
            {!canEmailNotification && <ProBadgeButton onClick={() => setUpgradeOpen(true)} />}
          </CardHeader>
          <CardContent
            className={cn(!canEmailNotification && "pointer-events-none opacity-50")}
          >
            <Input
              label={t("formSettings.notificationEmailsLabel")}
              description={t("formSettings.notificationEmailsHint")}
              placeholder={t("formSettings.notificationEmailsPlaceholder")}
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              onBlur={handleEmailsBlur}
              disabled={!canEmailNotification}
            />
          </CardContent>
        </Card>

        {/* Danger */}
        <Card className="border-red-100">
          <CardHeader>
            <h2 className="text-sm font-bold text-red-700">{t("settings.danger")}</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">{t("formSettings.dangerCloseTitle")}</p>
                <p className="text-xs text-gray-500">{t("formSettings.dangerCloseDescription")}</p>
              </div>
              {status === "closed" ? (
                <Button type="button" variant="secondary" size="sm" loading={reopenLoading} onClick={handleReopen}>
                  {t("builder.reopen")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={status !== "published"}
                  onClick={() => setCloseOpen(true)}
                >
                  {t("builder.close")}
                </Button>
              )}
            </div>
            <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">{t("formSettings.dangerDeleteTitle")}</p>
                <p className="text-xs text-gray-500">{t("formSettings.dangerDeleteDescription")}</p>
              </div>
              <Button type="button" variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                {t("common.delete")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title={t("form.closeConfirmTitle")}
        description={t("form.closeConfirmDescription")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCloseOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" loading={closeLoading} onClick={handleClose}>
              {t("builder.close")}
            </Button>
          </>
        }
      />

      <Modal
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteConfirm("");
        }}
        title={t("form.deleteConfirmTitle")}
        description={t("formSettings.dangerDeleteDescription")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" loading={deleteLoading} disabled={deleteConfirm !== title} onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </>
        }
      >
        <Input
          label={t("formSettings.dangerDeleteConfirmLabel", { title })}
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
        />
      </Modal>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <QRCodeModal open={qrOpen} onOpenChange={setQrOpen} url={formUrl} />
    </div>
  );
}
