"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { FormField, FormResponse, ResponseData } from "@kaemform/shared";
import { Button, EmptyState, Input, Skeleton } from "@/components/ui";
import { formatFieldValue } from "@/lib/export/response-format";

const PREVIEW_FIELD_COUNT = 5;

export function ResponsesTable({
  responses,
  previewFields,
  total,
  page,
  limit,
  loading,
  search,
  onSearchChange,
  onPageChange,
  onRowClick,
}: {
  responses: FormResponse[];
  previewFields: FormField[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRowClick: (response: FormResponse) => void;
}) {
  const t = useTranslations("responses");
  const tCommon = useTranslations("common");

  const columns = previewFields.slice(0, PREVIEW_FIELD_COUNT);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="max-w-sm"
      />

      <div className="hidden overflow-x-auto rounded-card border border-border bg-white shadow-card sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
              <th className="w-12 px-4 py-3 font-semibold">{t("tableNumber")}</th>
              <th className="px-4 py-3 font-semibold">{t("tableDate")}</th>
              {columns.map((field) => (
                <th key={field.id} className="px-4 py-3 font-semibold">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-3 py-3" colSpan={2 + columns.length}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : responses.length === 0 ? (
              <tr>
                <td colSpan={2 + columns.length} className="p-0">
                  <EmptyState icon={Inbox} title={t("emptyTitle")} description={t("emptyDescription")} className="border-none" />
                </td>
              </tr>
            ) : (
              responses.map((response, index) => {
                const data = response.data as ResponseData;
                return (
                  <tr
                    key={response.id}
                    onClick={() => onRowClick(response)}
                    className="cursor-pointer border-b border-slate-100 transition-colors odd:bg-white even:bg-slate-50/50 last:border-0 hover:bg-primary-50"
                  >
                    <td className="px-4 py-3 text-slate-400">{(page - 1) * limit + index + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {new Date(response.submitted_at).toLocaleString()}
                    </td>
                    {columns.map((field) => (
                      <td key={field.id} className="max-w-[200px] truncate px-4 py-3 text-slate-700">
                        {formatFieldValue(field, data[field.id], `[${field.label}]`)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 sm:hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-card" />
          ))
        ) : responses.length === 0 ? (
          <EmptyState icon={Inbox} title={t("emptyTitle")} description={t("emptyDescription")} />
        ) : (
          responses.map((response, index) => {
            const data = response.data as ResponseData;
            return (
              <button
                key={response.id}
                type="button"
                onClick={() => onRowClick(response)}
                className="rounded-card border border-border bg-white p-4 text-left shadow-card transition-all hover:-translate-y-px hover:border-primary-200 hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>#{(page - 1) * limit + index + 1}</span>
                  <span>{new Date(response.submitted_at).toLocaleString()}</span>
                </div>
                <dl className="mt-2 flex flex-col gap-1">
                  {columns.map((field) => (
                    <div key={field.id} className="flex items-start justify-between gap-3 text-sm">
                      <dt className="shrink-0 text-gray-500">{field.label}</dt>
                      <dd className="truncate text-right text-gray-900">
                        {formatFieldValue(field, data[field.id], `[${field.label}]`)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </button>
            );
          })
        )}
      </div>

      {!loading && responses.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{t("pageInfo", { page, total: totalPages })}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              {tCommon("back")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {tCommon("next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
