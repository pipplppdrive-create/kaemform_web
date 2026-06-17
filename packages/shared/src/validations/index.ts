import { z } from "zod";

export const FIELD_TYPE_VALUES = [
  "short_text",
  "long_text",
  "number",
  "email",
  "phone",
  "date",
  "time",
  "datetime",
  "single_choice",
  "multiple_choice",
  "dropdown",
  "scale",
  "signature",
  "section",
  "paragraph",
] as const;

export const fieldOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

export const fieldConditionSchema = z.object({
  field_id: z.string(),
  operator: z.enum(["equals", "not_equals", "contains", "is_empty", "is_not_empty"]),
  value: z.string().optional(),
  action: z.enum(["show", "hide"]),
});

export const fieldDependencySchema = z.object({
  field_id: z.string(),
  source: z.enum(["wilayah-514-kabkota"]).optional(),
  options_by_value: z.record(z.array(fieldOptionSchema)).optional(),
  placeholder: z.string().optional(),
  disabled_placeholder: z.string().optional(),
});

export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(FIELD_TYPE_VALUES),
  label: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  order: z.number(),
  group: z.string().nullable().optional(),
  options: z.array(fieldOptionSchema).optional(),
  validation: z
    .object({
      min_length: z.number().optional(),
      max_length: z.number().optional(),
      min_value: z.number().optional(),
      max_value: z.number().optional(),
    })
    .optional(),
  conditions: z.array(fieldConditionSchema).optional(),
  dependent: fieldDependencySchema.optional(),
  scaleMin: z.number().optional(),
  scaleMax: z.number().optional(),
  scaleMinLabel: z.string().optional(),
  scaleMaxLabel: z.string().optional(),
  content: z.string().optional(),
});

export const formSchemaSchema = z.array(formFieldSchema);

export const formSettingsSchema = z.object({
  retention_days: z.number().int().positive().optional(),
  allow_edit_after_submit: z.boolean().optional(),
  show_progress_bar: z.boolean().optional(),
  section_mode: z.enum(["single", "paged"]).optional(),
  success_message: z.string().optional(),
  redirect_url: z.string().url().nullable().optional().or(z.literal("")),
  limit_responses: z.number().int().positive().nullable().optional(),
  one_response_per_ip: z.boolean().optional(),
  require_login: z.boolean().optional(),
  notification_emails: z.array(z.string().email()).optional(),
  custom_close_message: z.string().nullable().optional(),
  remove_branding: z.boolean().optional(),
  theme: z
    .object({
      primary_color: z.string(),
      font: z.string(),
    })
    .optional(),
});

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Maksimal 100 karakter"),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  settings: z.record(z.unknown()).optional(),
});

export const createFormSchema = z.object({
  workspace_id: z.string().uuid(),
  title: z.string().trim().min(1, "Judul wajib diisi").max(200, "Maksimal 200 karakter"),
  template_id: z.string().uuid().optional(),
});

export const updateFormSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  schema: formSchemaSchema.optional(),
  settings: formSettingsSchema.optional(),
  status: z.enum(["draft", "published", "closed", "archived"]).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

export const submitResponseSchema = z.object({
  form_id: z.string().uuid(),
  data: z.record(z.unknown()),
  website: z.string().optional(), // honeypot
});

export const saveTemplateSchema = z.object({
  form_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional(),
});
