import type {
  AppSettings,
  DesktopAPI,
  DesktopUser,
  FormRecord,
  GenerateProgress,
  HistoryRecord,
  ImportedFileRecord,
  ResponseRecord,
  SyncStatus,
  TemplateRecord,
  WorkspaceRecord,
} from "../../../shared/types";

const now = new Date();
const iso = (minutesAgo = 0) => new Date(now.getTime() - minutesAgo * 60_000).toISOString();

const demoWorkspaces: WorkspaceRecord[] = [
  {
    id: "ws-demo",
    name: "Puslapdik",
    slug: "puslapdik",
    form_count: 3,
    response_count: 128,
    created_at: iso(10_000),
  },
];
const demoForms: FormRecord[] = [
  {
    id: "form-pegawai",
    workspace_id: "ws-demo",
    title: "Pendataan Pegawai 2026",
    status: "published",
    response_count: 52,
    schema: [
      { id: "nama", label: "Nama Lengkap" },
      { id: "nip", label: "NIP" },
      { id: "jabatan", label: "Jabatan" },
      { id: "instansi", label: "Instansi" },
    ],
  },
  {
    id: "form-hadir",
    workspace_id: "ws-demo",
    title: "Daftar Hadir Rapat",
    status: "published",
    response_count: 76,
    schema: [
      { id: "nama", label: "Nama Lengkap" },
      { id: "jabatan", label: "Jabatan" },
      { id: "instansi", label: "Instansi" },
    ],
  },
];
const names = ["Ahmad Fauzi", "Budi Santoso", "Citra Dewi", "Dian Permata", "Eka Putri"];
const demoResponses: ResponseRecord[] = names.map((name, index) => ({
  id: `response-${index}`,
  form_id: "form-pegawai",
  data: {
    nama: name,
    nip: `19890${index + 1}20260${index + 1}100${index + 1}`,
    jabatan: ["Kepala Bagian", "Analis", "Sekretaris", "Kepala Dinas", "Staf"][index],
    instansi: ["Dinas Pendidikan", "Bappeda", "Puslapdik", "Diskominfo", "BKD"][index],
  },
  submitted_at: iso(index * 18),
}));
const demoTemplates: TemplateRecord[] = [
  {
    id: "template-demo",
    name: "Biodata Pegawai",
    filename: "Biodata Pegawai.docx",
    filepath: "demo/Biodata Pegawai.docx",
    placeholders: ["Nama Lengkap", "NIP", "Jabatan", "Instansi"],
    created_at: iso(1400),
    updated_at: iso(1400),
  },
  {
    id: "template-surat",
    name: "Surat Tugas",
    filename: "Surat Tugas.docx",
    filepath: "demo/Surat Tugas.docx",
    placeholders: ["Nama Lengkap", "NIP", "Jabatan"],
    created_at: iso(3200),
    updated_at: iso(3200),
  },
];
const demoHistory: HistoryRecord[] = [
  {
    id: "history-demo",
    template_id: "template-demo",
    template_name: "Biodata Pegawai",
    data_source: "kaemform:form-pegawai",
    record_count: 50,
    output_formats: ["docx", "pdf"],
    output_path: "C:\\Users\\Demo\\KaemForm\\output\\Biodata_Pegawai",
    mapping: {
      "Nama Lengkap": "Nama Lengkap",
      NIP: "NIP",
      Jabatan: "Jabatan",
      Instansi: "Instansi",
    },
    status: "completed",
    created_at: iso(120),
  },
];
let mockUser: DesktopUser | null = null;
let mockSettings: AppSettings = {
  output_path: "C:\\Users\\Demo\\KaemForm\\output",
  sync_interval: "5",
  active_workspace: "ws-demo",
  theme: "light",
  last_synced: iso(2),
};
const authListeners = new Set<(user: DesktopUser | null) => void>();
const syncListeners = new Set<(status: SyncStatus) => void>();
const progressListeners = new Set<(progress: GenerateProgress) => void>();

function documentPreview(
  template: TemplateRecord,
  record: Record<string, unknown> = {},
  mapping: Record<string, string> = {}
): string {
  return `<article class="document-preview"><header><img class="mark" src="./kaemform.png" alt="KaemForm" /><div><small>KAEMFORM DOCUMENT</small><h1>${template.name}</h1></div></header><div class="line"></div><section>${template.placeholders
    .map(
      (placeholder) =>
        `<div class="row"><span>${placeholder}</span><strong>${String(
          record[mapping[placeholder] ?? placeholder] ?? `{{${placeholder}}}`
        )}</strong></div>`
    )
    .join("")}</section><footer>Dihasilkan oleh KaemForm Desktop</footer></article>`;
}

const mockApi: DesktopAPI = {
  auth: {
    login: async () => ({ configured: false }),
    password: async (email) => {
      mockUser = {
        id: "cloud-demo",
        name: email.split("@")[0] || "KaemForm",
        email,
        mode: "cloud",
        license: {
          type: "trial",
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          trial_started_at: new Date().toISOString(),
        },
      };
      authListeners.forEach((listener) => listener(mockUser));
      return mockUser;
    },
    local: async () => {
      mockUser = {
        id: "local-demo",
        name: "Kaemnur",
        email: "kaemnur@example.com",
        mode: "local",
        license: { type: "free", expires_at: null },
      };
      authListeners.forEach((listener) => listener(mockUser));
      return mockUser;
    },
    logout: async () => {
      mockUser = null;
      authListeners.forEach((listener) => listener(null));
    },
    session: async () => mockUser,
    onChanged: (listener) => {
      authListeners.add(listener);
      return () => authListeners.delete(listener);
    },
  },
  sync: {
    start: async () => {
      const syncing = { isSyncing: true, lastSynced: mockSettings.last_synced, error: null };
      syncListeners.forEach((listener) => listener(syncing));
      await new Promise((resolve) => setTimeout(resolve, 400));
      mockSettings.last_synced = new Date().toISOString();
      const done = { isSyncing: false, lastSynced: mockSettings.last_synced, error: null };
      syncListeners.forEach((listener) => listener(done));
      return done;
    },
    status: async () => ({
      isSyncing: false,
      lastSynced: mockSettings.last_synced,
      error: null,
    }),
    workspaces: async () => demoWorkspaces,
    forms: async (workspaceId) =>
      workspaceId ? demoForms.filter((form) => form.workspace_id === workspaceId) : demoForms,
    responses: async (formId) =>
      formId === "form-pegawai"
        ? demoResponses
        : demoResponses.map((response) => ({ ...response, form_id: formId })),
    onStatus: (listener) => {
      syncListeners.add(listener);
      return () => syncListeners.delete(listener);
    },
  },
  templates: {
    upload: async () => null,
    list: async () => demoTemplates,
    get: async (id) => demoTemplates.find((template) => template.id === id) ?? null,
    delete: async () => undefined,
    preview: async (id, record, mapping) => {
      const template = demoTemplates.find((item) => item.id === id) ?? demoTemplates[0];
      return documentPreview(template, record, mapping);
    },
  },
  excel: {
    import: async () => null,
    list: async () => [],
    delete: async () => undefined,
    generateRekap: async () => ({
      filePath: "C:\\Users\\Demo\\KaemForm\\rekap\\Rekap.xlsx",
      folderPath: "C:\\Users\\Demo\\KaemForm\\rekap",
    }),
  },
  generate: {
    start: async (params) => {
      for (let index = 1; index <= params.records.length; index += 1) {
        progressListeners.forEach((listener) =>
          listener({
            current: index,
            total: params.records.length,
            filename: `Dokumen_${index}.docx`,
            status: "generating",
          })
        );
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      return {
        success: params.records.length,
        failed: 0,
        outputPath: mockSettings.output_path,
        warnings: [],
      };
    },
    cancel: async () => undefined,
    openFolder: async () => undefined,
    onProgress: (listener) => {
      progressListeners.add(listener);
      return () => progressListeners.delete(listener);
    },
  },
  history: {
    list: async () => demoHistory,
    get: async (id) => demoHistory.find((history) => history.id === id) ?? null,
    openFolder: async () => undefined,
  },
  settings: {
    get: async () => mockSettings,
    update: async (values) => {
      mockSettings = { ...mockSettings, ...values };
      return mockSettings;
    },
    chooseOutput: async () => mockSettings.output_path,
  },
  external: {
    open: async () => undefined,
    openPath: async () => undefined,
    filePath: () => "",
  },
};

export const api: DesktopAPI = window.kaemform ?? mockApi;
export const usingMockApi = !window.kaemform;
