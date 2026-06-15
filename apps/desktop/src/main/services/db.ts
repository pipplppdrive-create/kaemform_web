import Database from "better-sqlite3";
import type {
  AppSettings,
  FormRecord,
  HistoryRecord,
  ImportedFileRecord,
  ResponseRecord,
  TemplateRecord,
  WorkspaceRecord,
} from "../../shared/types";

let database: Database.Database | null = null;

const schema = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    placeholders TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cache_workspaces (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    synced_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cache_forms (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    data TEXT NOT NULL,
    synced_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cache_responses (
    id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL,
    data TEXT NOT NULL,
    submitted_at TEXT,
    synced_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    data_source TEXT NOT NULL,
    record_count INTEGER NOT NULL,
    output_formats TEXT NOT NULL,
    output_path TEXT NOT NULL,
    mapping TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS imported_files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    filepath TEXT NOT NULL,
    headers TEXT NOT NULL,
    rows TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_cache_forms_workspace ON cache_forms(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_cache_responses_form ON cache_responses(form_id);
  CREATE INDEX IF NOT EXISTS idx_history_created ON history(created_at DESC);
`;

export function initDatabase(filePath: string, defaultOutputPath: string): void {
  database = new Database(filePath);
  database.exec(schema);

  const insert = database.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
  );
  const defaults: Record<string, string> = {
    output_path: defaultOutputPath,
    sync_interval: "5",
    active_workspace: "",
    theme: "light",
    last_synced: "",
  };

  const transaction = database.transaction(() => {
    Object.entries(defaults).forEach(([key, value]) => insert.run(key, value));
  });
  transaction();
}

export function getDb(): Database.Database {
  if (!database) throw new Error("Database belum diinisialisasi.");
  return database;
}

export function getSetting(key: string): string {
  const row = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value ?? "";
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value);
}

export function getSettings(): AppSettings {
  const rows = getDb().prepare("SELECT key, value FROM settings").all() as Array<{
    key: keyof AppSettings;
    value: string;
  }>;
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    output_path: settings.output_path ?? "",
    sync_interval: settings.sync_interval ?? "5",
    active_workspace: settings.active_workspace ?? "",
    theme: settings.theme ?? "light",
    last_synced: settings.last_synced ?? "",
  };
}

export function saveTemplate(template: Omit<TemplateRecord, "created_at" | "updated_at">): void {
  getDb()
    .prepare(
      `INSERT INTO templates (id, name, filename, filepath, placeholders)
       VALUES (@id, @name, @filename, @filepath, @placeholders)`
    )
    .run({ ...template, placeholders: JSON.stringify(template.placeholders) });
}

function parseTemplate(row: Record<string, unknown>): TemplateRecord {
  return {
    ...(row as unknown as TemplateRecord),
    placeholders: JSON.parse(String(row.placeholders)) as string[],
  };
}

export function listTemplates(): TemplateRecord[] {
  return (
    getDb().prepare("SELECT * FROM templates ORDER BY created_at DESC").all() as Record<
      string,
      unknown
    >[]
  ).map(parseTemplate);
}

export function getTemplate(id: string): TemplateRecord | null {
  const row = getDb().prepare("SELECT * FROM templates WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? parseTemplate(row) : null;
}

export function deleteTemplate(id: string): void {
  getDb().prepare("DELETE FROM templates WHERE id = ?").run(id);
}

export function replaceWorkspaces(records: WorkspaceRecord[]): void {
  const db = getDb();
  const save = db.prepare(
    `INSERT INTO cache_workspaces (id, data, synced_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, synced_at = excluded.synced_at`
  );
  db.transaction(() => records.forEach((record) => save.run(record.id, JSON.stringify(record))))();
}

export function replaceForms(records: FormRecord[]): void {
  const db = getDb();
  const save = db.prepare(
    `INSERT INTO cache_forms (id, workspace_id, data, synced_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET workspace_id = excluded.workspace_id, data = excluded.data, synced_at = excluded.synced_at`
  );
  db.transaction(() =>
    records.forEach((record) => save.run(record.id, record.workspace_id, JSON.stringify(record)))
  )();
}

export function replaceResponses(records: ResponseRecord[]): void {
  const db = getDb();
  const save = db.prepare(
    `INSERT INTO cache_responses (id, form_id, data, submitted_at, synced_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET form_id = excluded.form_id, data = excluded.data,
       submitted_at = excluded.submitted_at, synced_at = excluded.synced_at`
  );
  db.transaction(() =>
    records.forEach((record) =>
      save.run(record.id, record.form_id, JSON.stringify(record), record.submitted_at ?? null)
    )
  )();
}

export function listWorkspaces(): WorkspaceRecord[] {
  const rows = getDb()
    .prepare("SELECT data FROM cache_workspaces ORDER BY synced_at DESC")
    .all() as Array<{ data: string }>;
  return rows.map((row) => JSON.parse(row.data) as WorkspaceRecord);
}

export function listForms(workspaceId?: string): FormRecord[] {
  const rows = (workspaceId
    ? getDb()
        .prepare("SELECT data FROM cache_forms WHERE workspace_id = ? ORDER BY synced_at DESC")
        .all(workspaceId)
    : getDb().prepare("SELECT data FROM cache_forms ORDER BY synced_at DESC").all()) as Array<{
    data: string;
  }>;
  return rows.map((row) => JSON.parse(row.data) as FormRecord);
}

export function listResponses(formId: string): ResponseRecord[] {
  const rows = getDb()
    .prepare(
      "SELECT data FROM cache_responses WHERE form_id = ? ORDER BY submitted_at DESC, synced_at DESC"
    )
    .all(formId) as Array<{ data: string }>;
  return rows.map((row) => JSON.parse(row.data) as ResponseRecord);
}

export function saveImportedFile(
  file: Omit<ImportedFileRecord, "created_at">
): void {
  getDb()
    .prepare(
      `INSERT INTO imported_files (id, name, filepath, headers, rows)
       VALUES (@id, @name, @filepath, @headers, @rows)`
    )
    .run({
      ...file,
      headers: JSON.stringify(file.headers),
      rows: JSON.stringify(file.rows),
    });
}

export function listImportedFiles(): ImportedFileRecord[] {
  const rows = getDb()
    .prepare("SELECT * FROM imported_files ORDER BY created_at DESC")
    .all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    ...(row as unknown as ImportedFileRecord),
    headers: JSON.parse(String(row.headers)) as string[],
    rows: JSON.parse(String(row.rows)) as Record<string, unknown>[],
  }));
}

export function getImportedFile(id: string): ImportedFileRecord | null {
  return listImportedFiles().find((file) => file.id === id) ?? null;
}

export function deleteImportedFile(id: string): void {
  getDb().prepare("DELETE FROM imported_files WHERE id = ?").run(id);
}

export function saveHistory(history: Omit<HistoryRecord, "created_at" | "template_name">): void {
  getDb()
    .prepare(
      `INSERT INTO history
       (id, template_id, data_source, record_count, output_formats, output_path, mapping, status)
       VALUES (@id, @template_id, @data_source, @record_count, @output_formats, @output_path, @mapping, @status)`
    )
    .run({
      ...history,
      output_formats: JSON.stringify(history.output_formats),
      mapping: JSON.stringify(history.mapping),
    });
}

function parseHistory(row: Record<string, unknown>): HistoryRecord {
  return {
    ...(row as unknown as HistoryRecord),
    output_formats: JSON.parse(String(row.output_formats)) as string[],
    mapping: JSON.parse(String(row.mapping)) as Record<string, string>,
  };
}

export function listHistory(): HistoryRecord[] {
  const rows = getDb()
    .prepare(
      `SELECT h.*, t.name AS template_name
       FROM history h LEFT JOIN templates t ON t.id = h.template_id
       ORDER BY h.created_at DESC`
    )
    .all() as Array<Record<string, unknown>>;
  return rows.map(parseHistory);
}

export function getHistory(id: string): HistoryRecord | null {
  const row = getDb()
    .prepare(
      `SELECT h.*, t.name AS template_name
       FROM history h LEFT JOIN templates t ON t.id = h.template_id
       WHERE h.id = ?`
    )
    .get(id) as Record<string, unknown> | undefined;
  return row ? parseHistory(row) : null;
}
