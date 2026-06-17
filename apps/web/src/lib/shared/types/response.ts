import type { SignatureData } from "./signature";

export type ResponseFieldValue =
  | string
  | number
  | string[]
  | SignatureData
  | null;

export type ResponseData = Record<string, ResponseFieldValue>;

export interface ResponseMetadata {
  ip_hash?: string;
  user_agent?: string;
  [key: string]: unknown;
}

export interface FormResponse {
  id: string;
  form_id: string;
  respondent_id: string | null;
  data: ResponseData;
  metadata: ResponseMetadata;
  submitted_at: string;
  expires_at: string | null;
  deleted_at: string | null;
}

export interface ResponseStats {
  total: number;
  today: number;
  thisWeek: number;
  perDay: { date: string; count: number }[];
}

export type RetentionLogAction = "reminder_sent" | "deleted" | "extended";

export interface RetentionLog {
  id: string;
  form_id: string;
  workspace_id: string;
  action: RetentionLogAction;
  responses_count: number | null;
  executed_at: string;
}
