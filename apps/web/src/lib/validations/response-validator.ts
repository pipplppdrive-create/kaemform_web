import type { FormField, ResponseData, SignatureData } from "@kaemform/shared";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{6,20}$/;
const SIGNATURE_MIN_POINTS = 10;

export interface ResponseFieldError {
  key: "required" | "email" | "phone" | "minLength" | "maxLength" | "minValue" | "maxValue" | "signature";
  params?: Record<string, number>;
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

export function validateResponse(
  fields: FormField[],
  data: ResponseData,
  visibility: Record<string, boolean>
): Record<string, ResponseFieldError> {
  const errors: Record<string, ResponseFieldError> = {};

  for (const field of fields) {
    if (field.type === "section" || field.type === "paragraph") continue;
    if (visibility[field.id] === false) continue;

    const value = data[field.id] ?? null;

    if (field.required && isEmptyValue(value)) {
      errors[field.id] = { key: "required" };
      continue;
    }
    if (isEmptyValue(value)) continue;

    switch (field.type) {
      case "email":
        if (!EMAIL_REGEX.test(String(value))) errors[field.id] = { key: "email" };
        break;
      case "phone":
        if (!PHONE_REGEX.test(String(value))) errors[field.id] = { key: "phone" };
        break;
      case "short_text":
      case "long_text": {
        const length = String(value).length;
        const { min_length, max_length } = field.validation ?? {};
        if (min_length !== undefined && length < min_length) {
          errors[field.id] = { key: "minLength", params: { min: min_length } };
        } else if (max_length !== undefined && length > max_length) {
          errors[field.id] = { key: "maxLength", params: { max: max_length } };
        }
        break;
      }
      case "number": {
        const num = Number(value);
        const { min_value, max_value } = field.validation ?? {};
        if (min_value !== undefined && num < min_value) {
          errors[field.id] = { key: "minValue", params: { min: min_value } };
        } else if (max_value !== undefined && num > max_value) {
          errors[field.id] = { key: "maxValue", params: { max: max_value } };
        }
        break;
      }
      case "signature": {
        const signature = value as SignatureData;
        const totalPoints = signature.strokes?.reduce((sum, stroke) => sum + stroke.points.length, 0) ?? 0;
        if (!signature.strokes || signature.strokes.length === 0 || totalPoints < SIGNATURE_MIN_POINTS) {
          errors[field.id] = { key: "signature" };
        }
        break;
      }
      default:
        break;
    }
  }

  return errors;
}
