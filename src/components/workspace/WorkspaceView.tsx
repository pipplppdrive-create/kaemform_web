"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, FileCheck2, FileText, MessageSquare, Plus } from "lucide-react";
import type { Form, FormStatus, Workspace } from "@kaemform/shared";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
} from "@/components/ui";
import { useToast } from "@/stores/toastStore";
import { FormCard } from "./FormCard";
import { TemplateModal } from "./TemplateModal";
import { WorkspaceSettingsMenu } from "./WorkspaceSettingsMenu";

type StatusFilter = "all" | FormStatus;
type SortOption = "newest" | "title" | "responses";

export function WorkspaceView({
  workspace,
  forms,
  maxForms,
  canCustomSlug,
  maxResponsesPerForm,
}: {
  workspace: Workspace;
  forms: Form[];
  maxForms: number;
  canCustomSlug: boolean;
  maxResponsesPerForm: number;
}) {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [creatingBlank, setCreatingBlank] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const atLimit = maxForms !== -1 && forms.length >= maxForms;
  const publishedCount = forms.filter((form) => form.status === "published").length;
  const draftCount = forms.filter((form) => form.status === "draft").length;
  const responseCount = forms.reduce((sum, form) => sum + form.response_count, 0);

  const visibleForms = useMemo(() => {
    let result = forms;
    if (statusFilter !== "all") {
      result = result.filter((form) => form.status === statusFilter);
    }

    return [...result].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "responses") return b.response_count - a.response_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [forms, statusFilter, sortBy]);

  const handleCreateBlank = async () => {
    setCreatingBlank(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspace.id, title: t("form.untitledForm") }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast({
          title: json.error === "tier_limit_forms" ? t("workspace.limitFormsReached") : t("common.error"),
          variant: "error",
        });
        return;
      }

      router.push(`/app/w/${workspace.slug}/f/${json.form.id as string}`);
    } catch {
      toast({ title: t("common.networkError"), variant: "error" });
    } finally {
      setCreatingBlank(false);
    }
  };

  const stats = [
    { Icon: FileText, value: forms.length, label: t("common.total") },
    { Icon: FileCheck2, value: publishedCount, label: t("common.published") },
    { Icon: FileText, value: draftCount, label: t("common.draft") },
    { Icon: MessageSquare, value: responseCount, label: t("dashboard.responses") },
  ];

  return (
    <div className="page-container">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/app" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-primary-700">
            <ArrowLeft className="h-4 w-4" />
            {t("nav.workspaces")}
          </Link>
          <h1 className="page-heading mt-3">{workspace.name}</h1>
          <p className="page-subtitle">Buat, publikasikan, dan pantau seluruh formulir di workspace ini.</p>
        </div>
        <WorkspaceSettingsMenu workspace={workspace} />
      </div>

      {atLimit && <p className="mt-3 text-sm font-medium text-amber-600">{t("workspace.limitFormsReached")}</p>}

      <div className="mt-7 grid overflow-hidden rounded-card border border-border bg-white shadow-card sm:grid-cols-4">
        {stats.map(({ Icon, value, label }, index) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-5 py-4 ${
              index > 0 ? "border-t border-slate-100 sm:border-l sm:border-t-0" : ""
            }`}
          >
            <Icon className="h-4 w-4 text-primary-500" />
            <div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Formulir</h2>
          <p className="mt-1 text-sm text-slate-500">{visibleForms.length} formulir ditampilkan</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {forms.length > 0 && (
            <>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                aria-label={t("workspace.filterStatus")}
                className="h-10 rounded-input border border-border bg-white px-3 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:border-primary-200"
              >
                <option value="all">{t("common.all")}</option>
                <option value="draft">{t("common.draft")}</option>
                <option value="published">{t("common.published")}</option>
                <option value="closed">{t("common.closed")}</option>
                <option value="archived">{t("common.archived")}</option>
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                aria-label={t("workspace.sortBy")}
                className="h-10 rounded-input border border-border bg-white px-3 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:border-primary-200"
              >
                <option value="newest">{t("workspace.sortNewest")}</option>
                <option value="title">{t("workspace.sortTitle")}</option>
                <option value="responses">{t("workspace.sortResponses")}</option>
              </select>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={atLimit || creatingBlank} loading={creatingBlank}>
                <Plus className="h-4 w-4" />
                {t("workspace.createForm")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleCreateBlank}>{t("workspace.createBlank")}</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTemplateModalOpen(true)}>
                {t("workspace.createFromTemplate")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-5">
        {forms.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("workspace.emptyTitle")}
            description={t("workspace.emptyDescription")}
            action={
              <Button onClick={() => setTemplateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("workspace.createForm")}
              </Button>
            }
          />
        ) : visibleForms.length === 0 ? (
          <EmptyState icon={FileText} title={t("workspace.noSearchResults")} />
        ) : (
          <div className="flex flex-col gap-3">
            {visibleForms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                workspaceSlug={workspace.slug}
                canCustomSlug={canCustomSlug}
                maxResponsesPerForm={maxResponsesPerForm}
              />
            ))}
          </div>
        )}
      </div>

      <TemplateModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        workspaceId={workspace.id}
        workspaceSlug={workspace.slug}
      />
    </div>
  );
}
