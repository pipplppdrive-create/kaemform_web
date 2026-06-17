"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  BookmarkPlus,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Link2,
  MoreVertical,
  Pencil,
  QrCode,
  Settings,
  Trash2,
} from "lucide-react";
import type { Form, FormStatus } from "@kaemform/shared";
import {
  Badge,
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Modal,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/stores/toastStore";
import { QRCodeModal } from "@/components/shared/QRCodeModal";

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

export function FormCard({
  form,
  workspaceSlug,
  canCustomSlug,
}: {
  form: Form;
  workspaceSlug: string;
  canCustomSlug: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState(form.title);
  const [templateDescription, setTemplateDescription] = useState("");
  const [saveTemplateLoading, setSaveTemplateLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<FormStatus>(form.status);
  const [slug, setSlug] = useState(form.slug);
  const [customSlug, setCustomSlug] = useState(form.slug);
  const [customSlugError, setCustomSlugError] = useState<string | null>(null);
  const [customSlugOpen, setCustomSlugOpen] = useState(false);
  const [customSlugLoading, setCustomSlugLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const base = `/app/w/${workspaceSlug}/f/${form.id}`;
  const formUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${slug}`;
  const isPublic = status === "published" || status === "closed";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    toast({ title: t("common.copied"), variant: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${form.id}/duplicate`, { method: "POST" });
      if (!res.ok) {
        toast({ title: t("common.error"), variant: "error" });
        return;
      }
      router.refresh();
    } catch {
      toast({ title: t("common.networkError"), variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    const title = templateTitle.trim();
    if (!title) return;

    setSaveTemplateLoading(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: form.id,
          title,
          description: templateDescription.trim() || undefined,
        }),
      });
      if (!res.ok) {
        toast({ title: t("common.error"), variant: "error" });
        return;
      }
      setSaveTemplateOpen(false);
      toast({ title: t("templates.saveSuccess"), variant: "success" });
    } catch {
      toast({ title: t("common.networkError"), variant: "error" });
    } finally {
      setSaveTemplateLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${form.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ title: t("common.error"), variant: "error" });
        return;
      }
      setDeleteOpen(false);
      router.refresh();
    } catch {
      toast({ title: t("common.networkError"), variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (action: "publish" | "close" | "reopen") => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/forms/${form.id}/${action}`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: json.error === "form_empty" ? t("form.publishRequiresField") : t("common.error"),
          variant: "error",
        });
        return;
      }

      setStatus(action === "close" ? "closed" : "published");
      setPublishOpen(false);
      setCloseOpen(false);
      setReopenOpen(false);
      router.refresh();
    } catch {
      toast({ title: t("common.networkError"), variant: "error" });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCustomSlug = async () => {
    const nextSlug = customSlug.trim().toLowerCase();
    if (!SLUG_REGEX.test(nextSlug)) {
      setCustomSlugError(t("formSettings.slugHint"));
      return;
    }

    setCustomSlugLoading(true);
    setCustomSlugError(null);
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: nextSlug }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCustomSlugError(
          json.error === "slug_immutable" ? t("formSettings.slugHint") : t("common.error")
        );
        return;
      }

      setSlug(nextSlug);
      setCustomSlugOpen(false);
      toast({ title: t("common.savedCheck"), variant: "success" });
      router.refresh();
    } catch {
      setCustomSlugError(t("common.networkError"));
    } finally {
      setCustomSlugLoading(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col gap-4 p-4 transition-all duration-150 hover:-translate-y-px hover:border-primary-200 hover:shadow-card-hover sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <Link href={base}>
            <h3 className="truncate text-sm font-bold text-slate-900 transition-colors hover:text-primary-700 sm:text-[15px]">
              {form.title || t("form.untitledForm")}
            </h3>
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <Badge variant={status} className="px-3 py-1.5 text-xs">
              {t(`common.${status}`)}
            </Badge>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <BarChart3 className="h-4 w-4 text-primary-500" />
              {t("form.responseCount", { count: form.response_count })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {new Date(form.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1 sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-input p-2 text-slate-400 outline-none transition-colors hover:bg-white hover:text-slate-700 hover:shadow-sm"
              aria-label={t("common.actions")}
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={base} className="flex w-full items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  {t("form.menu.edit")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${base}/responses`} className="flex w-full items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {t("form.menu.responses")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${base}/settings`} className="flex w-full items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t("form.menu.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleDuplicate}>
                <Copy className="h-4 w-4" />
                {t("form.menu.duplicate")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setTemplateTitle(form.title);
                  setTemplateDescription("");
                  setSaveTemplateOpen(true);
                }}
              >
                <BookmarkPlus className="h-4 w-4" />
                {t("form.menu.saveAsTemplate")}
              </DropdownMenuItem>
              <DropdownMenuItem variant="danger" onSelect={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                {t("form.menu.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!canCustomSlug}
              onClick={() => {
                setCustomSlug(slug);
                setCustomSlugError(null);
                setCustomSlugOpen(true);
              }}
            >
              <Link2 className="h-4 w-4" />
              {t("form.menu.customLink")}
            </Button>
            {isPublic && (
              <Button type="button" variant="secondary" size="sm" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t("common.copied") : t("formSettings.copyLink")}
              </Button>
            )}
            {isPublic && (
              <Button type="button" variant="secondary" size="sm" onClick={() => setQrOpen(true)}>
                <QrCode className="h-4 w-4" />
                {t("form.menu.downloadQr")}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!isPublic}
              onClick={() => window.open(formUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4" />
              {t("common.preview")}
            </Button>
            <Link href={`${base}/responses`}>
              <Button type="button" variant="secondary" size="sm">
                <BarChart3 className="h-4 w-4" />
                {t("form.menu.responses")}
              </Button>
            </Link>
          </div>

          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => router.push(base)}>
              <Pencil className="h-4 w-4" />
              {t("form.menu.edit")}
            </Button>
            {status === "draft" && (
              <Button type="button" size="sm" onClick={() => setPublishOpen(true)}>
                {t("form.menu.openResponses")}
              </Button>
            )}
            {status === "published" && (
              <Button type="button" variant="danger" size="sm" onClick={() => setCloseOpen(true)}>
                {t("form.menu.closeResponses")}
              </Button>
            )}
            {status === "closed" && (
              <Button type="button" size="sm" onClick={() => setReopenOpen(true)}>
                {t("form.menu.openResponses")}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("form.deleteConfirmTitle")}
        description={t("form.deleteConfirmDescription", { title: form.title || t("form.untitledForm") })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" loading={loading} onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </>
        }
      />

      <Modal
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        title={t("templates.saveModalTitle")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSaveTemplateOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              loading={saveTemplateLoading}
              disabled={!templateTitle.trim()}
              onClick={handleSaveTemplate}
            >
              {t("common.save")}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label={t("templates.saveModalNameLabel")}
            value={templateTitle}
            onChange={(e) => setTemplateTitle(e.target.value)}
          />
          <Textarea
            label={t("templates.saveModalDescLabel")}
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={customSlugOpen}
        onOpenChange={setCustomSlugOpen}
        title={t("form.menu.customLink")}
        description={t("formSettings.customLinkHint")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCustomSlugOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button loading={customSlugLoading} disabled={!customSlug.trim()} onClick={handleCustomSlug}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        <Input
          label={t("formSettings.slugLabel")}
          value={customSlug}
          onChange={(event) => setCustomSlug(event.target.value.toLowerCase())}
          error={customSlugError ?? undefined}
          description={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${customSlug || "link-form"}`}
        />
      </Modal>

      <Modal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title={t("form.publishConfirmTitle")}
        description={t("form.publishConfirmDescription")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPublishOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button loading={statusLoading} onClick={() => updateStatus("publish")}>
              {t("form.menu.openResponses")}
            </Button>
          </>
        }
      />

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
            <Button variant="danger" loading={statusLoading} onClick={() => updateStatus("close")}>
              {t("form.menu.closeResponses")}
            </Button>
          </>
        }
      />

      <Modal
        open={reopenOpen}
        onOpenChange={setReopenOpen}
        title={t("form.reopenConfirmTitle")}
        description={t("form.reopenConfirmDescription")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReopenOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button loading={statusLoading} onClick={() => updateStatus("reopen")}>
              {t("form.menu.openResponses")}
            </Button>
          </>
        }
      />

      <QRCodeModal open={qrOpen} onOpenChange={setQrOpen} url={formUrl} />
    </>
  );
}
