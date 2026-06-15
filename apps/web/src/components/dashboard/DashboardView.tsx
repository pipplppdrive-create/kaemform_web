"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, FileText, FolderOpen, MessageSquare, Plus } from "lucide-react";
import type { WorkspaceWithStats } from "@kaemform/shared";
import { Button, Card, Modal } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { CreateWorkspaceForm } from "./CreateWorkspaceForm";

export function DashboardView({
  workspaces,
  maxWorkspaces,
}: {
  workspaces: WorkspaceWithStats[];
  maxWorkspaces: number;
}) {
  const t = useTranslations();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const atLimit = maxWorkspaces !== -1 && workspaces.length >= maxWorkspaces;
  const totalForms = workspaces.reduce((sum, workspace) => sum + workspace.form_count, 0);
  const totalResponses = workspaces.reduce((sum, workspace) => sum + workspace.response_count, 0);
  const displayName = user.name?.split(" ")[0] ?? user.email.split("@")[0];

  if (workspaces.length === 0) {
    return (
      <div className="brand-wash flex min-h-[calc(100vh-3.75rem)] items-center justify-center p-4 py-12">
        <Card className="w-full max-w-lg border-white/80 p-6 shadow-form sm:p-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 ring-8 ring-primary-50">
            <FolderOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("onboarding.title")}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{t("onboarding.subtitle")}</p>
          <div className="mt-6">
            <CreateWorkspaceForm />
          </div>
        </Card>
      </div>
    );
  }

  const stats = [
    { Icon: FolderOpen, value: workspaces.length, label: t("dashboard.yourWorkspaces") },
    { Icon: FileText, value: totalForms, label: t("dashboard.forms") },
    { Icon: MessageSquare, value: totalResponses, label: t("dashboard.responses") },
  ];

  return (
    <div className="page-container">
      <div>
        <p className="text-sm font-semibold text-primary-600">{t("dashboard.title")}</p>
        <h1 className="page-heading mt-1">Selamat datang, {displayName}</h1>
        <p className="page-subtitle">Kelola formulir dan pantau respons dari workspace Anda.</p>
      </div>

      {atLimit && <p className="mt-3 text-sm font-medium text-amber-600">{t("dashboard.limitReached")}</p>}

      <div className="mt-7 grid overflow-hidden rounded-card border border-primary-100 bg-primary-50 shadow-card sm:grid-cols-3">
        {stats.map(({ Icon, value, label }, index) => (
          <div
            key={label}
            className={`flex items-center gap-4 px-5 py-4 ${
              index > 0 ? "border-t border-primary-100 sm:border-l sm:border-t-0" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-input bg-white text-primary-600 shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-800">{value}</p>
              <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("dashboard.yourWorkspaces")}</h2>
          <p className="mt-1 text-sm text-slate-500">{workspaces.length} workspace aktif</p>
        </div>
        <Button onClick={() => setModalOpen(true)} disabled={atLimit}>
          <Plus className="h-4 w-4" />
          {t("dashboard.newWorkspace")}
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Link key={workspace.id} href={`/app/w/${workspace.slug}`} className="group">
            <Card className="relative h-full overflow-hidden p-5 transition-all duration-150 hover:-translate-y-px hover:border-primary-200 hover:shadow-card-hover">
              <div className="absolute inset-y-0 left-0 w-1 bg-primary-500" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-input bg-primary-50 text-primary-700">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
              </div>
              <h2 className="mt-5 text-base font-bold text-slate-900">{workspace.name}</h2>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-slate-500">
                <span>{workspace.form_count} {t("dashboard.forms")}</span>
                <span>{workspace.response_count} {t("dashboard.responses")}</span>
              </div>
              <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400">
                {t("dashboard.createdAt")} {new Date(workspace.created_at).toLocaleDateString("id-ID")}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={t("dashboard.newWorkspace")}>
        <CreateWorkspaceForm />
      </Modal>
    </div>
  );
}
