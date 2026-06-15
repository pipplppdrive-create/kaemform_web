"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileText, LayoutTemplate, Trash2 } from "lucide-react";
import type { FormTemplate } from "@kaemform/shared";
import { Button, Card, Modal, Spinner } from "@/components/ui";
import { useToast } from "@/stores/toastStore";

type Tab = "system" | "mine";

export function TemplateModal({
  open,
  onOpenChange,
  workspaceId,
  workspaceSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceSlug: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>("system");
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/templates?filter=${tab}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setTemplates(json.templates ?? []);
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, tab]);

  const handleDelete = async (template: FormTemplate) => {
    if (!window.confirm(t("templates.deleteConfirm"))) return;

    setDeletingId(template.id);
    try {
      const res = await fetch(`/api/templates/${template.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ title: t("common.error"), variant: "error" });
        return;
      }
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== template.id));
    } catch {
      toast({ title: t("common.networkError"), variant: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUse = async (template: FormTemplate) => {
    setCreatingId(template.id);

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          title: template.title,
          template_id: template.id,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast({
          title: json.error === "tier_limit_forms" ? t("workspace.limitFormsReached") : t("common.error"),
          variant: "error",
        });
        return;
      }

      router.push(`/app/w/${workspaceSlug}/f/${json.form.id as string}`);
    } catch {
      toast({ title: t("common.networkError"), variant: "error" });
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("templates.modalTitle")} className="max-w-3xl">
      <div className="flex gap-1 rounded-input bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("system")}
          className={`flex-1 rounded-[8px] px-3 py-2 text-sm font-semibold transition-all ${
            tab === "system" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {t("templates.tabSystem")}
        </button>
        <button
          type="button"
          onClick={() => setTab("mine")}
          className={`flex-1 rounded-[8px] px-3 py-2 text-sm font-semibold transition-all ${
            tab === "mine" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {t("templates.tabMine")}
        </button>
      </div>

      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-900">
              {tab === "mine" ? t("templates.emptyMine") : t("common.noData")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="group flex flex-col gap-3 p-5 transition-all hover:-translate-y-px hover:border-primary-200 hover:shadow-card-hover">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-input bg-primary-50 text-primary-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  {tab === "mine" && (
                    <button
                      type="button"
                      onClick={() => handleDelete(template)}
                      disabled={deletingId === template.id}
                      className="shrink-0 rounded-input p-1 text-gray-400 hover:bg-red-50 hover:text-error disabled:opacity-50"
                      aria-label={t("common.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-slate-900">{template.title}</h3>
                {template.description && (
                  <p className="line-clamp-2 text-sm leading-6 text-slate-500">{template.description}</p>
                )}
                <p className="text-xs font-medium text-slate-400">
                  {t("templates.fieldCount", { count: template.schema?.length ?? 0 })}
                </p>
                <Button
                  size="sm"
                  className="mt-auto w-full"
                  loading={creatingId === template.id}
                  onClick={() => handleUse(template)}
                >
                  {t("templates.useTemplate")}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
