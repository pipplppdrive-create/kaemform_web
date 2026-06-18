"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, CalendarDays, Download, MessageSquare, RefreshCw, Timer, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Form, FormResponse, ResponseStats } from "@kaemform/shared";
import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui";
import { useToast } from "@/stores/toastStore";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getExportFields } from "@/lib/export/response-format";
import { ResponsesChart } from "./ResponsesChart";
import { ResponsesTable } from "./ResponsesTable";
import { ResponseDetailModal } from "./ResponseDetailModal";

const LIMIT = 20;
const RETENTION_WARNING_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const KAEMFORM_DOWNLOAD_URL = "https://www.kaemnur.com/products/KaemForm";

const linkButtonClass = cn(
  "inline-flex h-9 items-center gap-1.5 rounded-input border border-primary-200 bg-white px-3 text-[13px] font-semibold text-primary-700 shadow-sm",
  "transition-all hover:-translate-y-px hover:bg-primary-50"
);

function applyRealtimeStats(stats: ResponseStats, response: FormResponse): ResponseStats {
  const submittedAt = new Date(response.submitted_at);
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const perDay = stats.perDay.map((entry, i) =>
    i === stats.perDay.length - 1 ? { ...entry, count: entry.count + 1 } : entry
  );

  return {
    total: stats.total + 1,
    today: submittedAt >= startOfToday ? stats.today + 1 : stats.today,
    thisWeek: submittedAt >= startOfWeek ? stats.thisWeek + 1 : stats.thisWeek,
    perDay,
  };
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accentClass,
}: {
  label: string;
  value: number | null;
  icon: LucideIcon;
  accentClass: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute inset-y-0 left-0 w-[3px]", accentClass)} />
      <CardContent className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-input bg-slate-50 text-primary-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          {value === null ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          )}
          <p className="mt-0.5 text-[13px] text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResponsesView({
  form,
  workspaceSlug,
  canExportPdf,
}: {
  form: Form;
  workspaceSlug: string;
  canExportPdf: boolean;
}) {
  const t = useTranslations("responses");
  const toast = useToast();

  const [stats, setStats] = useState<ResponseStats | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

  const pageRef = useRef(page);
  const searchRef = useRef(debouncedSearch);
  pageRef.current = page;
  searchRef.current = debouncedSearch;

  const previewFields = getExportFields(form.schema);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetch(`/api/forms/${form.id}/stats`)
      .then((res) => res.json())
      .then((json) => setStats(json.stats as ResponseStats))
      .catch(() => {});
  }, [form.id]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`/api/forms/${form.id}/responses?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setResponses((json.data ?? []) as FormResponse[]);
        setTotal((json.total ?? 0) as number);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [form.id, page, debouncedSearch]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`responses-${form.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "responses", filter: `form_id=eq.${form.id}` },
        (payload) => {
          const newResponse = payload.new as FormResponse;

          setStats((prev) => (prev ? applyRealtimeStats(prev, newResponse) : prev));

          if (pageRef.current === 1 && !searchRef.current) {
            setResponses((prev) => [newResponse, ...prev].slice(0, LIMIT));
          }
          setTotal((prev) => prev + 1);

          toast({ title: t("newResponse"), variant: "default" });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id]);

  const hasExpiringSoon = responses.some(
    (response) => response.expires_at && new Date(response.expires_at).getTime() - Date.now() < RETENTION_WARNING_MS
  );
  const nextExpiry = responses
    .map((response) => (response.expires_at ? new Date(response.expires_at).getTime() : null))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b)[0];
  const expiryDays = nextExpiry
    ? Math.max(0, Math.ceil((nextExpiry - Date.now()) / DAY_MS))
    : form.settings.retention_days;
  const expiryDate = nextExpiry ? new Date(nextExpiry).toLocaleDateString("id-ID") : "-";
  const handleSyncDesktop = () => {
    const syncUrl = `kaemform://sync?form_id=${encodeURIComponent(form.id)}&workspace_slug=${encodeURIComponent(
      workspaceSlug
    )}`;
    let fallbackTimer: number | null = null;
    const clearFallback = () => {
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };

    window.addEventListener("blur", clearFallback, { once: true });
    fallbackTimer = window.setTimeout(() => {
      window.removeEventListener("blur", clearFallback);
      window.location.href = KAEMFORM_DOWNLOAD_URL;
    }, 1000);
    window.location.href = syncUrl;
  };

  return (
    <div className="flex min-h-[calc(100dvh-59px)] flex-col bg-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/app/w/${workspaceSlug}/f/${form.id}`}
            className="rounded-input p-2 text-slate-400 transition-colors hover:bg-primary-50 hover:text-primary-700"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{form.title}</h1>
            <p className="text-sm text-slate-500">{t("title")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href={`/api/forms/${form.id}/export/csv`} download className={linkButtonClass}>
            <Download className="h-4 w-4" />
            {t("exportCsv")}
          </a>
          {canExportPdf ? (
            <a href={`/api/forms/${form.id}/export/pdf`} download className={linkButtonClass}>
              <Download className="h-4 w-4" />
              {t("exportPdf")}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => toast({ title: t("pdfUpgradeRequired"), variant: "default" })}
              className={cn(linkButtonClass, "cursor-not-allowed opacity-50")}
            >
              <Download className="h-4 w-4" />
              {t("exportPdf")}
            </button>
          )}
        </div>
      </div>

      <div className="page-container flex flex-col gap-6">
        <div className="rounded-card border border-primary-100 bg-primary-50 px-4 py-3 text-sm leading-6 text-primary-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
              <div>
                <p className="font-semibold">
                  {t("retentionCountdown", { days: expiryDays, date: expiryDate })}
                </p>
                <p className="text-xs leading-5 text-primary-700">
                  {t("retentionBanner", { days: form.settings.retention_days })}
                  {hasExpiringSoon && <span className="ml-2 font-medium text-amber-700">{t("retentionWarning")}</span>}
                  <span className="ml-2">{t("retentionBackupHint")}</span>
                </p>
              </div>
            </div>
            <button type="button" onClick={handleSyncDesktop} className={linkButtonClass}>
              <RefreshCw className="h-4 w-4" />
              {t("syncDesktop")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label={t("summaryTotal")}
            value={stats?.total ?? null}
            icon={MessageSquare}
            accentClass="bg-primary-500"
          />
          <SummaryCard
            label={t("summaryToday")}
            value={stats?.today ?? null}
            icon={CalendarDays}
            accentClass="bg-emerald-500"
          />
          <SummaryCard
            label={t("summaryWeek")}
            value={stats?.thisWeek ?? null}
            icon={TrendingUp}
            accentClass="bg-primary-300"
          />
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-bold text-slate-900">{t("chartTitle")}</h2>
          </CardHeader>
          <CardContent>
            {stats ? <ResponsesChart data={stats.perDay} /> : <Skeleton className="h-40 w-full" />}
          </CardContent>
        </Card>

        <ResponsesTable
          responses={responses}
          previewFields={previewFields}
          total={total}
          page={page}
          limit={LIMIT}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          onPageChange={setPage}
          onRowClick={setSelectedResponse}
        />
      </div>

      <ResponseDetailModal response={selectedResponse} fields={form.schema} onClose={() => setSelectedResponse(null)} />
    </div>
  );
}
