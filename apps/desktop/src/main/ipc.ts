import { promises as fs } from "node:fs";
import path from "node:path";
import { BrowserWindow, dialog, ipcMain, shell } from "electron";
import { nanoid } from "nanoid";
import type { AppSettings, GenerateParams, RekapParams } from "../shared/types";
import {
  deleteImportedFile,
  deleteTemplate,
  getHistory,
  getImportedFile,
  getSetting,
  getSettings,
  getTemplate,
  listForms,
  listHistory,
  listImportedFiles,
  listResponses,
  listTemplates,
  listWorkspaces,
  saveHistory,
  saveImportedFile,
  saveTemplate,
  setSetting,
} from "./services/db";
import { extractPlaceholders, generateDocuments, previewHtml } from "./services/docx-engine";
import { generateRecap, readSpreadsheet } from "./services/excel-engine";
import { copyIntoFolder, getFolders } from "./services/file-manager";
import { SyncEngine } from "./services/sync-engine";

let generationCancelled = false;

async function pickFile(
  window: BrowserWindow,
  filters: Electron.FileFilter[]
): Promise<string | null> {
  const result = await dialog.showOpenDialog(window, {
    properties: ["openFile"],
    filters,
  });
  return result.canceled ? null : result.filePaths[0] ?? null;
}

export function registerIpc(window: BrowserWindow, syncEngine: SyncEngine): void {
  ipcMain.handle("auth:login", async (_event, mode: "login" | "register" = "login") => {
    const url = await syncEngine.loginUrl(mode);
    if (!url) return { configured: false };
    await shell.openExternal(url);
    return { configured: true };
  });
  ipcMain.handle("auth:password", (_event, email: string, password: string) =>
    syncEngine.loginWithPassword(email, password)
  );
  ipcMain.handle("auth:local", () => syncEngine.loginLocal());
  ipcMain.handle("auth:logout", () => syncEngine.logout());
  ipcMain.handle("auth:get-session", () => syncEngine.restoreSession());

  ipcMain.handle("sync:start", (_event, incremental = false) =>
    syncEngine.syncAll(Boolean(incremental))
  );
  ipcMain.handle("sync:status", () => syncEngine.getStatus());
  ipcMain.handle("sync:get-workspaces", () => listWorkspaces());
  ipcMain.handle("sync:get-forms", (_event, workspaceId?: string) => listForms(workspaceId));
  ipcMain.handle("sync:get-responses", (_event, formId: string) => listResponses(formId));

  ipcMain.handle("template:upload", async (_event, providedPath?: string) => {
    const sourcePath =
      providedPath ||
      (await pickFile(window, [{ name: "Word Template", extensions: ["docx"] }]));
    if (!sourcePath) return null;
    if (path.extname(sourcePath).toLowerCase() !== ".docx") {
      throw new Error("Template harus berupa file .docx.");
    }
    const destination = await copyIntoFolder(sourcePath, getFolders().templates);
    const placeholders = await extractPlaceholders(destination);
    const now = new Date().toISOString();
    const template = {
      id: nanoid(),
      name: path.basename(sourcePath, path.extname(sourcePath)),
      filename: path.basename(sourcePath),
      filepath: destination,
      placeholders,
    };
    saveTemplate(template);
    return { ...template, created_at: now, updated_at: now };
  });
  ipcMain.handle("template:list", () => listTemplates());
  ipcMain.handle("template:get", (_event, id: string) => getTemplate(id));
  ipcMain.handle("template:delete", async (_event, id: string) => {
    const template = getTemplate(id);
    if (template) await fs.unlink(template.filepath).catch(() => undefined);
    deleteTemplate(id);
  });
  ipcMain.handle(
    "template:preview",
    (
      _event,
      id: string,
      record: Record<string, unknown> = {},
      mapping: Record<string, string> = {}
    ) => {
      const template = getTemplate(id);
      if (!template) throw new Error("Template tidak ditemukan.");
      return previewHtml(template.placeholders, record, mapping);
    }
  );

  ipcMain.handle("excel:import", async (_event, providedPath?: string) => {
    const sourcePath =
      providedPath ||
      (await pickFile(window, [
        { name: "Spreadsheet", extensions: ["xlsx", "xls", "csv"] },
      ]));
    if (!sourcePath) return null;
    const extension = path.extname(sourcePath).toLowerCase();
    if (![".xlsx", ".xls", ".csv"].includes(extension)) {
      throw new Error("Data harus berupa file .xlsx, .xls, atau .csv.");
    }
    const destination = await copyIntoFolder(sourcePath, getFolders().data);
    const parsed = await readSpreadsheet(destination);
    const file = {
      id: nanoid(),
      name: path.basename(sourcePath),
      filepath: destination,
      headers: parsed.headers,
      rows: parsed.rows,
    };
    saveImportedFile(file);
    return { ...file, created_at: new Date().toISOString() };
  });
  ipcMain.handle("excel:list", () => listImportedFiles());
  ipcMain.handle("excel:delete", async (_event, id: string) => {
    const file = getImportedFile(id);
    if (file) await fs.unlink(file.filepath).catch(() => undefined);
    deleteImportedFile(id);
  });
  ipcMain.handle("excel:generate-rekap", async (_event, params: RekapParams) => {
    const filePath = await generateRecap(params, getFolders().rekap);
    return { filePath, folderPath: path.dirname(filePath) };
  });

  ipcMain.handle("generate:start", async (_event, params: GenerateParams) => {
    const template = getTemplate(params.templateId);
    if (!template) throw new Error("Template tidak ditemukan.");
    generationCancelled = false;
    const result = await generateDocuments({
      templatePath: template.filepath,
      templateName: template.name,
      records: params.records,
      mapping: params.mapping,
      outputFormats: params.outputFormats,
      outputPath: params.outputPath || getSetting("output_path") || getFolders().output,
      isCancelled: () => generationCancelled,
      onProgress: (progress) => window.webContents.send("generate:progress", progress),
    });
    saveHistory({
      id: nanoid(),
      template_id: template.id,
      data_source: params.dataSource,
      record_count: result.success,
      output_formats: params.outputFormats,
      output_path: result.outputPath,
      mapping: params.mapping,
      status: generationCancelled ? "cancelled" : result.failed ? "partial" : "completed",
    });
    return result;
  });
  ipcMain.handle("generate:cancel", () => {
    generationCancelled = true;
  });
  ipcMain.handle("generate:open-folder", (_event, folderPath: string) =>
    shell.openPath(folderPath)
  );

  ipcMain.handle("riwayat:list", () => listHistory());
  ipcMain.handle("riwayat:get", (_event, id: string) => getHistory(id));
  ipcMain.handle("riwayat:open-folder", (_event, folderPath: string) =>
    shell.openPath(folderPath)
  );

  ipcMain.handle("settings:get", () => getSettings());
  ipcMain.handle("settings:update", (_event, values: Partial<AppSettings>) => {
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined) setSetting(key, String(value));
    });
    syncEngine.startSchedule();
    return getSettings();
  });
  ipcMain.handle("settings:set-output-path", async () => {
    const result = await dialog.showOpenDialog(window, {
      properties: ["openDirectory", "createDirectory"],
      defaultPath: getSetting("output_path") || getFolders().output,
    });
    if (result.canceled) return null;
    const outputPath = result.filePaths[0] ?? null;
    if (outputPath) setSetting("output_path", outputPath);
    return outputPath;
  });

  ipcMain.handle("external:open", (_event, url: string) => shell.openExternal(url));
  ipcMain.handle("external:open-path", (_event, filePath: string) => shell.openPath(filePath));
}
