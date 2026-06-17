"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Form, FormField, ResponseData, ResponseFieldValue } from "@kaemform/shared";
import { Button } from "@/components/ui";
import { useToast } from "@/stores/toastStore";
import { evaluateConditions } from "@/lib/conditions";
import { validateResponse } from "@/lib/validations/response-validator";
import { FieldRendererRegistry, NON_INPUT_TYPES } from "./fields/FieldInput";

export interface FormRendererProps {
  form: Pick<Form, "id" | "title" | "description" | "schema" | "settings">;
  formSlug?: string;
  preview?: boolean;
  hideBranding?: boolean;
}

const DEFAULT_PRIMARY_COLOR = "#2E86DE";

export function FormRenderer({ form, formSlug, preview, hideBranding }: FormRendererProps) {
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();

  const fields = useMemo(() => [...form.schema].sort((a, b) => a.order - b.order), [form.schema]);

  const [formData, setFormData] = useState<ResponseData>({});
  const [errors, setErrors] = useState<Record<string, { key: string; params?: Record<string, number> }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const visibility = useMemo(() => evaluateConditions(fields, formData), [fields, formData]);
  const sectionMode = form.settings.section_mode ?? "single";
  const primaryColor = form.settings.theme?.primary_color || DEFAULT_PRIMARY_COLOR;
  const hasCustomColor = primaryColor.toUpperCase() !== DEFAULT_PRIMARY_COLOR;
  const visibleSectionFields = useMemo(
    () => fields.filter((field) => field.type === "section" && visibility[field.id] !== false),
    [fields, visibility]
  );
  const pages = useMemo(() => {
    const groups: FormField[][] = [];
    let current: FormField[] = [];

    for (const field of fields) {
      if (field.type === "section") {
        if (current.length > 0) groups.push(current);
        current = [field];
      } else {
        current.push(field);
      }
    }

    if (current.length > 0) groups.push(current);

    const visibleGroups = groups
      .map((group) => group.filter((field) => visibility[field.id] !== false))
      .filter((group) => group.length > 0);

    return visibleGroups.length > 0 ? visibleGroups : [[]];
  }, [fields, visibility]);
  const paged = sectionMode === "paged" && pages.length > 1;
  const visibleFields = paged ? pages[currentPage] ?? [] : fields.filter((field) => visibility[field.id] !== false);

  useEffect(() => {
    if (!form.settings.show_progress_bar) return;

    const handleScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [form.settings.show_progress_bar]);

  useEffect(() => {
    setFormData((prev) => {
      let changed = false;
      const next: ResponseData = {};

      for (const [fieldId, value] of Object.entries(prev)) {
        if (visibility[fieldId] === false) {
          changed = true;
          continue;
        }
        next[fieldId] = value;
      }

      return changed ? next : prev;
    });

    setErrors((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const fieldId of Object.keys(next)) {
        if (visibility[fieldId] === false) {
          delete next[fieldId];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [visibility]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(pages.length - 1, 0)));
  }, [pages.length]);

  const setValue = (fieldId: string, value: ResponseFieldValue) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const getFieldErrorText = (fieldId: string) => {
    const fieldError = errors[fieldId];
    return fieldError ? t(`publicForm.validation.${fieldError.key}`, fieldError.params) : undefined;
  };

  const validateFields = (targetFields: FormField[]) => {
    const fieldErrors = validateResponse(targetFields, formData, visibility);
    setErrors((prev) => {
      const targetIds = new Set(targetFields.map((field) => field.id));
      const next = { ...prev };

      for (const fieldId of targetIds) {
        delete next[fieldId];
      }

      return { ...next, ...fieldErrors };
    });
    return Object.keys(fieldErrors).length === 0;
  };

  const handleNextPage = () => {
    const currentFields = pages[currentPage] ?? [];
    if (!validateFields(currentFields)) return;
    setCurrentPage((page) => Math.min(page + 1, pages.length - 1));
  };

  const handleBlurValidate = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const fieldErrors = validateResponse([field], formData, visibility);
    setErrors((prev) => {
      const next = { ...prev };
      const fieldError = fieldErrors[field.id];
      if (fieldError) next[field.id] = fieldError;
      else delete next[field.id];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (paged && currentPage < pages.length - 1) {
      handleNextPage();
      return;
    }

    const fieldErrors = validateResponse(fields, formData, visibility);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    if (preview) {
      toast({ title: t("builder.previewSubmitNotice"), variant: "default" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: form.id, data: formData }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast({
          title: json.error === "rate_limited" ? t("common.rateLimited") : t("common.error"),
          variant: "error",
        });
        setIsSubmitting(false);
        return;
      }

      if (formSlug) {
        router.push(`/${formSlug}/success`);
      }
    } catch {
      toast({ title: t("common.networkError"), variant: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 py-8 sm:py-12">
      {form.settings.show_progress_bar && (
        <div className="fixed left-0 top-0 z-50 h-1 w-full bg-primary-50">
          <div
            className="h-full bg-primary-600 transition-all"
            style={{ width: `${progress}%`, ...(hasCustomColor && { backgroundColor: primaryColor }) }}
          />
        </div>
      )}

      <div className="rounded-[18px] border border-white/80 bg-white p-5 shadow-form sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{form.title}</h1>
        {form.description && <p className="mt-2 text-sm leading-6 text-slate-500">{form.description}</p>}
        <div className="mt-6 h-0.5 rounded-full bg-gradient-to-r from-primary-200 via-primary-100 to-transparent" />

        {paged && (
          <div className="mt-6 flex flex-wrap gap-2">
            {pages.map((_page, index) => (
              <button
                key={index}
                type="button"
                onClick={() => index <= currentPage && setCurrentPage(index)}
                disabled={index > currentPage}
                className={`flex h-9 min-w-9 items-center justify-center rounded-input border px-3 text-sm font-semibold transition ${
                  index === currentPage
                    ? "border-primary-600 bg-primary-600 text-white"
                    : index < currentPage
                      ? "border-primary-100 bg-primary-50 text-primary-700 hover:border-primary-300"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
                aria-label={t("publicForm.goToSection", { n: index + 1 })}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute h-0 w-0 opacity-0"
          />

          {visibleFields.map((field) => {
            const Component = FieldRendererRegistry[field.type];
            const sectionIndex = visibleSectionFields.findIndex((item) => item.id === field.id);
            const sectionMeta =
              sectionIndex === -1 ? undefined : { index: sectionIndex + 1, total: visibleSectionFields.length };

            if (NON_INPUT_TYPES.includes(field.type)) {
              return (
                <Component
                  key={field.id}
                  field={field}
                  value={null}
                  onChange={() => undefined}
                  sectionMeta={sectionMeta}
                />
              );
            }

            const error = getFieldErrorText(field.id);

            return (
              <div key={field.id} onBlur={() => handleBlurValidate(field.id)}>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  {field.label}
                  {field.required && <span className="text-error"> *</span>}
                </label>
                {field.description && <p className="mb-2 text-xs leading-5 text-slate-500">{field.description}</p>}
                <Component
                  field={field}
                  value={formData[field.id] ?? null}
                  onChange={(value) => setValue(field.id, value)}
                  error={error}
                  sectionMeta={sectionMeta}
                />
              </div>
            );
          })}

          {paged ? (
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={currentPage === 0 || isSubmitting}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                className={currentPage === 0 ? "hidden sm:inline-flex" : undefined}
              >
                {t("common.back")}
              </Button>
              {currentPage < pages.length - 1 ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={handleNextPage}
                  className="w-full"
                  style={hasCustomColor ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                >
                  {t("common.next")}
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full"
                  style={hasCustomColor ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                >
                  {isSubmitting ? t("publicForm.submitting") : t("publicForm.submit")}
                </Button>
              )}
            </div>
          ) : (
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              size="lg"
              className="mt-1 w-full"
              style={hasCustomColor ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
            >
              {isSubmitting ? t("publicForm.submitting") : t("publicForm.submit")}
            </Button>
          )}
        </form>
      </div>

      {!hideBranding && <p className="mt-5 text-center text-xs font-medium text-slate-400">{t("publicForm.poweredBy")}</p>}
    </div>
  );
}
