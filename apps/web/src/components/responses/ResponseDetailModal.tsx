"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { FormField, FormResponse, ResponseData, SignatureData } from "@kaemform/shared";
import { SignatureRenderer } from "@/components/shared/SignatureRenderer";
import { getExportFields, formatFieldValue } from "@/lib/export/response-format";

function isSignatureData(value: unknown): value is SignatureData {
  return !!value && typeof value === "object" && "strokes" in value && "canvas" in value;
}

export function ResponseDetailModal({
  response,
  fields,
  onClose,
}: {
  response: FormResponse | null;
  fields: FormField[];
  onClose: () => void;
}) {
  const t = useTranslations("responses");
  const exportFields = getExportFields(fields);
  const data = (response?.data ?? {}) as ResponseData;

  return (
    <Dialog.Root open={!!response} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-border bg-white shadow-form data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-5 py-4 backdrop-blur">
            <div>
              <Dialog.Title className="text-lg font-bold text-slate-900">{t("detailTitle")}</Dialog.Title>
              {response && (
                <Dialog.Description className="mt-1 text-xs text-slate-500">
                  {new Date(response.submitted_at).toLocaleString()}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="rounded-input p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {response && (
            <div className="flex flex-col gap-6 p-5">
              <div className="flex flex-col gap-3">
                {exportFields.map((field) => {
                  const value = data[field.id];
                  return (
                    <div key={field.id} className="rounded-card border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">{field.label}</p>
                      {field.type === "signature" && isSignatureData(value) ? (
                        <SignatureRenderer data={value} className="mt-2" />
                      ) : (
                        <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">
                          {formatFieldValue(field, value, "") || t("noValue")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  {t("metadataTitle")}
                </h3>
                <dl className="flex flex-col gap-2 text-xs text-slate-500">
                  <div className="flex justify-between gap-3">
                    <dt>{t("submittedAt")}</dt>
                    <dd className="text-right font-medium text-slate-700">
                      {new Date(response.submitted_at).toLocaleString()}
                    </dd>
                  </div>
                  {response.metadata?.ip_hash && (
                    <div className="flex justify-between gap-3">
                      <dt>{t("ipHash")}</dt>
                      <dd className="truncate font-mono text-slate-700">{String(response.metadata.ip_hash)}</dd>
                    </div>
                  )}
                  {response.metadata?.user_agent && (
                    <div className="flex justify-between gap-3">
                      <dt>{t("userAgent")}</dt>
                      <dd className="max-w-[65%] truncate text-right text-slate-700">
                        {String(response.metadata.user_agent)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
