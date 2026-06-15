import type { FormField, ResponseFieldValue } from "@kaemform/shared";

const NON_VALUE_TYPES: FormField["type"][] = ["section", "paragraph"];

/** Fields that hold submitted data, in display order (sections/paragraphs are layout-only). */
export function getExportFields(fields: FormField[]): FormField[] {
  return fields
    .filter((field) => !NON_VALUE_TYPES.includes(field.type))
    .slice()
    .sort((a, b) => a.order - b.order);
}

/** Renders a response value as plain text for CSV/PDF export. */
export function formatFieldValue(
  field: FormField,
  value: ResponseFieldValue | undefined,
  signatureLabel: string
): string {
  if (value === null || value === undefined || value === "") return "";
  if (field.type === "signature") return signatureLabel;
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}
