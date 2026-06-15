export interface DesktopUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  mode?: "cloud" | "local";
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug?: string;
  form_count: number;
  response_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface FormField {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}

export interface FormRecord {
  id: string;
  workspace_id: string;
  title: string;
  slug?: string;
  status?: string;
  response_count: number;
  schema: FormField[];
  created_at?: string;
  updated_at?: string;
}

export interface ResponseRecord {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  submitted_at?: string;
}

export interface TemplateRecord {
  id: string;
  name: string;
  filename: string;
  filepath: string;
  placeholders: string[];
  created_at: string;
  updated_at: string;
}

export interface ImportedFileRecord {
  id: string;
  name: string;
  filepath: string;
  headers: string[];
  rows: Record<string, unknown>[];
  created_at: string;
}

export interface HistoryRecord {
  id: string;
  template_id: string;
  template_name?: string;
  data_source: string;
  record_count: number;
  output_formats: string[];
  output_path: string;
  mapping: Record<string, string>;
  status: string;
  created_at: string;
}

export interface AppSettings {
  output_path: string;
  sync_interval: string;
  active_workspace: string;
  theme: string;
  last_synced: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSynced: string | null;
  error: string | null;
}

export interface GenerateProgress {
  current: number;
  total: number;
  filename: string;
  status: "preparing" | "generating" | "completed" | "cancelled" | "error";
}

export interface GenerateParams {
  templateId: string;
  records: Record<string, unknown>[];
  mapping: Record<string, string>;
  outputFormats: Array<"docx" | "pdf">;
  outputPath?: string;
  dataSource: string;
}

export interface GenerateResult {
  success: number;
  failed: number;
  outputPath: string;
  warnings: string[];
}

export interface RekapParams {
  title: string;
  sourceName: string;
  rows: Record<string, unknown>[];
  columns: string[];
}

export interface DesktopAPI {
  auth: {
    login: () => Promise<{ configured: boolean }>;
    local: () => Promise<DesktopUser>;
    logout: () => Promise<void>;
    session: () => Promise<DesktopUser | null>;
    onChanged: (listener: (user: DesktopUser | null) => void) => () => void;
  };
  sync: {
    start: (incremental?: boolean) => Promise<SyncStatus>;
    status: () => Promise<SyncStatus>;
    workspaces: () => Promise<WorkspaceRecord[]>;
    forms: (workspaceId?: string) => Promise<FormRecord[]>;
    responses: (formId: string) => Promise<ResponseRecord[]>;
    onStatus: (listener: (status: SyncStatus) => void) => () => void;
  };
  templates: {
    upload: (filePath?: string) => Promise<TemplateRecord | null>;
    list: () => Promise<TemplateRecord[]>;
    get: (id: string) => Promise<TemplateRecord | null>;
    delete: (id: string) => Promise<void>;
    preview: (
      id: string,
      record?: Record<string, unknown>,
      mapping?: Record<string, string>
    ) => Promise<string>;
  };
  excel: {
    import: (filePath?: string) => Promise<ImportedFileRecord | null>;
    list: () => Promise<ImportedFileRecord[]>;
    delete: (id: string) => Promise<void>;
    generateRekap: (params: RekapParams) => Promise<{ filePath: string; folderPath: string }>;
  };
  generate: {
    start: (params: GenerateParams) => Promise<GenerateResult>;
    cancel: () => Promise<void>;
    openFolder: (folderPath: string) => Promise<void>;
    onProgress: (listener: (progress: GenerateProgress) => void) => () => void;
  };
  history: {
    list: () => Promise<HistoryRecord[]>;
    get: (id: string) => Promise<HistoryRecord | null>;
    openFolder: (folderPath: string) => Promise<void>;
  };
  settings: {
    get: () => Promise<AppSettings>;
    update: (values: Partial<AppSettings>) => Promise<AppSettings>;
    chooseOutput: () => Promise<string | null>;
  };
  external: {
    open: (url: string) => Promise<void>;
    openPath: (path: string) => Promise<void>;
    filePath: (file: File) => string;
  };
}
