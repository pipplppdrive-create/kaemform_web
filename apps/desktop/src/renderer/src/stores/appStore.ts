import { create } from "zustand";
import type {
  AppSettings,
  DesktopUser,
  FormRecord,
  HistoryRecord,
  ImportedFileRecord,
  SyncStatus,
  TemplateRecord,
  WorkspaceRecord,
} from "../../../shared/types";
import { api } from "../lib/api";

interface AppState {
  initialized: boolean;
  user: DesktopUser | null;
  workspaces: WorkspaceRecord[];
  forms: FormRecord[];
  templates: TemplateRecord[];
  importedFiles: ImportedFileRecord[];
  history: HistoryRecord[];
  settings: AppSettings | null;
  syncStatus: SyncStatus;
  initialize: () => Promise<void>;
  loadData: () => Promise<void>;
  setUser: (user: DesktopUser | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  updateSettings: (values: Partial<AppSettings>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  initialized: false,
  user: null,
  workspaces: [],
  forms: [],
  templates: [],
  importedFiles: [],
  history: [],
  settings: null,
  syncStatus: { isSyncing: false, lastSynced: null, error: null },

  initialize: async () => {
    const [user, settings, syncStatus] = await Promise.all([
      api.auth.session(),
      api.settings.get(),
      api.sync.status(),
    ]);
    set({ user, settings, syncStatus, initialized: true });
    if (user) await get().loadData();
  },
  loadData: async () => {
    const activeWorkspace = get().settings?.active_workspace;
    const [workspaces, forms, templates, importedFiles, history] = await Promise.all([
      api.sync.workspaces(),
      api.sync.forms(activeWorkspace || undefined),
      api.templates.list(),
      api.excel.list(),
      api.history.list(),
    ]);
    set({ workspaces, forms, templates, importedFiles, history });
  },
  setUser: (user) => set({ user }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  updateSettings: async (values) => {
    const settings = await api.settings.update(values);
    set({ settings });
    if (values.active_workspace !== undefined) await get().loadData();
  },
}));
