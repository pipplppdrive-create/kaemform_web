export type FieldType =
  | "short_text"
  | "long_text"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "time"
  | "datetime"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "scale"
  | "signature"
  | "section"
  | "paragraph";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "is_empty"
  | "is_not_empty";

export type ConditionAction = "show" | "hide";

export interface FieldCondition {
  field_id: string;
  operator: ConditionOperator;
  value?: string;
  action: ConditionAction;
}

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FieldValidation {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
}

export type DependentOptionsSource = "wilayah-514-kabkota";

export interface FieldDependency {
  field_id: string;
  source?: DependentOptionsSource;
  options_by_value?: Record<string, FieldOption[]>;
  placeholder?: string;
  disabled_placeholder?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  group?: string | null;
  options?: FieldOption[];
  validation?: FieldValidation;
  conditions?: FieldCondition[];
  dependent?: FieldDependency;
  /** scale field */
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  /** paragraph field */
  content?: string;
}

export type FormSchema = FormField[];

export type FormStatus = "draft" | "published" | "closed" | "archived";

export interface FormThemeSettings {
  primary_color: string;
  font: string;
}

export interface FormSettings {
  retention_days: number;
  allow_edit_after_submit: boolean;
  show_progress_bar: boolean;
  section_mode: "single" | "paged";
  success_message: string;
  redirect_url: string | null;
  limit_responses: number | null;
  one_response_per_ip: boolean;
  require_login: boolean;
  notification_emails: string[];
  custom_close_message: string | null;
  remove_branding: boolean;
  theme: FormThemeSettings;
}

export interface Form {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  slug: string;
  schema: FormSchema;
  settings: FormSettings;
  status: FormStatus;
  response_count: number;
  created_by: string | null;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string | null;
  category: string;
  schema: FormSchema;
  settings: Partial<FormSettings>;
  is_system: boolean;
  created_by: string | null;
  usage_count: number;
  created_at: string;
}

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  retention_days: 30,
  allow_edit_after_submit: false,
  show_progress_bar: true,
  section_mode: "single",
  success_message: "Terima kasih, respons Anda telah tersimpan.",
  redirect_url: null,
  limit_responses: null,
  one_response_per_ip: false,
  require_login: false,
  notification_emails: [],
  custom_close_message: null,
  remove_branding: false,
  theme: { primary_color: "#2563EB", font: "default" },
};
