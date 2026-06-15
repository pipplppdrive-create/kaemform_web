import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FormRecord, ResponseRecord } from "../../../shared/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function timeAgo(value?: string | null): string {
  if (!value) return "Belum pernah";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "baru saja";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}j`;
  return `${Math.floor(seconds / 86400)}h`;
}

export function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[{}_\-\s]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function autoMap(
  placeholders: string[],
  columns: string[]
): Record<string, string> {
  return Object.fromEntries(
    placeholders.flatMap((placeholder) => {
      const match = columns.find(
        (column) => normalizeKey(column) === normalizeKey(placeholder)
      );
      return match ? [[placeholder, match]] : [];
    })
  );
}

export function responsesToRows(
  form: FormRecord,
  responses: ResponseRecord[]
): Record<string, unknown>[] {
  const labels = new Map(form.schema.map((field) => [field.id, field.label]));
  return responses.map((response) => ({
    ...Object.fromEntries(
      Object.entries(response.data).map(([key, value]) => [labels.get(key) ?? key, value])
    ),
    "Waktu respons": response.submitted_at ?? "",
  }));
}

export function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}
