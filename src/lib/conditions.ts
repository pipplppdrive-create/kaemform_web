import type { FieldCondition, FormField, ResponseData, ResponseFieldValue } from "@kaemform/shared";

function matchesCondition(value: ResponseFieldValue, condition: FieldCondition): boolean {
  const target = condition.value ?? "";

  switch (condition.operator) {
    case "equals":
      return Array.isArray(value) ? value.includes(target) : String(value ?? "") === target;
    case "not_equals":
      return Array.isArray(value) ? !value.includes(target) : String(value ?? "") !== target;
    case "contains":
      return Array.isArray(value)
        ? value.some((v) => v.includes(target))
        : String(value ?? "").includes(target);
    case "is_empty":
      return Array.isArray(value) ? value.length === 0 : value === null || value === undefined || value === "";
    case "is_not_empty":
      return Array.isArray(value)
        ? value.length > 0
        : !(value === null || value === undefined || value === "");
    default:
      return true;
  }
}

/** Single condition per field (MVP). A field with no condition is always visible. */
export function evaluateConditions(
  fields: FormField[],
  data: ResponseData
): Record<string, boolean> {
  const visibility: Record<string, boolean> = {};
  let currentSectionVisible = true;

  for (const field of [...fields].sort((a, b) => a.order - b.order)) {
    const condition = field.conditions?.[0];
    if (!condition) {
      visibility[field.id] = field.type === "section" ? true : currentSectionVisible;
      if (field.type === "section") currentSectionVisible = true;
      continue;
    }

    if (visibility[condition.field_id] === false) {
      visibility[field.id] = false;
      if (field.type === "section") currentSectionVisible = false;
      continue;
    }

    const matches = matchesCondition(data[condition.field_id] ?? null, condition);
    const conditionVisible = condition.action === "show" ? matches : !matches;
    visibility[field.id] = field.type === "section" ? conditionVisible : currentSectionVisible && conditionVisible;
    if (field.type === "section") currentSectionVisible = conditionVisible;
  }

  return visibility;
}
