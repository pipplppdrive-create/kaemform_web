import { contextBridge, ipcRenderer, webUtils } from "electron";
import type {
  AppSettings,
  DesktopAPI,
  DesktopUser,
  GenerateParams,
  GenerateProgress,
  RekapParams,
  SyncStatus,
} from "../shared/types";

function onEvent<T>(channel: string, listener: (value: T) => void): () => void {
  const handler = (_event: Electron.IpcRendererEvent, value: T) => listener(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

const api: DesktopAPI = {
  auth: {
    login: () => ipcRenderer.invoke("auth:login"),
    password: (email: string, password: string) =>
      ipcRenderer.invoke("auth:password", email, password),
    local: () => ipcRenderer.invoke("auth:local"),
    logout: () => ipcRenderer.invoke("auth:logout"),
    session: () => ipcRenderer.invoke("auth:get-session"),
    onChanged: (listener: (user: DesktopUser | null) => void) =>
      onEvent("auth:changed", listener),
  },
  sync: {
    start: (incremental = false) => ipcRenderer.invoke("sync:start", incremental),
    status: () => ipcRenderer.invoke("sync:status"),
    workspaces: () => ipcRenderer.invoke("sync:get-workspaces"),
    forms: (workspaceId?: string) => ipcRenderer.invoke("sync:get-forms", workspaceId),
    responses: (formId: string) => ipcRenderer.invoke("sync:get-responses", formId),
    onStatus: (listener: (status: SyncStatus) => void) => onEvent("sync:status", listener),
  },
  templates: {
    upload: (filePath?: string) => ipcRenderer.invoke("template:upload", filePath),
    list: () => ipcRenderer.invoke("template:list"),
    get: (id: string) => ipcRenderer.invoke("template:get", id),
    delete: (id: string) => ipcRenderer.invoke("template:delete", id),
    preview: (
      id: string,
      record?: Record<string, unknown>,
      mapping?: Record<string, string>
    ) => ipcRenderer.invoke("template:preview", id, record, mapping),
  },
  excel: {
    import: (filePath?: string) => ipcRenderer.invoke("excel:import", filePath),
    list: () => ipcRenderer.invoke("excel:list"),
    delete: (id: string) => ipcRenderer.invoke("excel:delete", id),
    generateRekap: (params: RekapParams) => ipcRenderer.invoke("excel:generate-rekap", params),
  },
  generate: {
    start: (params: GenerateParams) => ipcRenderer.invoke("generate:start", params),
    cancel: () => ipcRenderer.invoke("generate:cancel"),
    openFolder: (folderPath: string) => ipcRenderer.invoke("generate:open-folder", folderPath),
    onProgress: (listener: (progress: GenerateProgress) => void) =>
      onEvent("generate:progress", listener),
  },
  history: {
    list: () => ipcRenderer.invoke("riwayat:list"),
    get: (id: string) => ipcRenderer.invoke("riwayat:get", id),
    openFolder: (folderPath: string) => ipcRenderer.invoke("riwayat:open-folder", folderPath),
  },
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    update: (values: Partial<AppSettings>) => ipcRenderer.invoke("settings:update", values),
    chooseOutput: () => ipcRenderer.invoke("settings:set-output-path"),
  },
  external: {
    open: (url: string) => ipcRenderer.invoke("external:open", url),
    openPath: (path: string) => ipcRenderer.invoke("external:open-path", path),
    filePath: (file: File) =>
      typeof webUtils.getPathForFile === "function"
        ? webUtils.getPathForFile(file)
        : ((file as File & { path?: string }).path ?? ""),
  },
};

contextBridge.exposeInMainWorld("kaemform", api);
