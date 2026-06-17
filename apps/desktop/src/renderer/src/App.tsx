import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Cloud,
  Database,
  ExternalLink,
  FileOutput,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  History,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  PanelLeftClose,
  Play,
  RefreshCw,
  RotateCcw,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  WandSparkles,
  XCircle,
} from "lucide-react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import type {
  FormRecord,
  HistoryRecord,
  ImportedFileRecord,
  TemplateRecord,
} from "../../shared/types";
import { DataTable } from "./components/DataTable";
import { DragDropZone } from "./components/DragDropZone";
import { TemplateCard } from "./components/TemplateCard";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  ProgressBar,
  Select,
} from "./components/ui";
import { api, usingMockApi } from "./lib/api";
import {
  autoMap,
  cn,
  formatDate,
  responsesToRows,
  timeAgo,
} from "./lib/utils";
import { useAppStore } from "./stores/appStore";
import { useGenerateStore, type DataSource } from "./stores/generateStore";

function KaemFormLogo({ className }: { className: string }) {
  return (
    <img
      src="./kaemform.png"
      alt="KaemForm"
      className={cn("shrink-0 object-cover", className)}
    />
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="text-center">
        <KaemFormLogo className="mx-auto h-16 w-16 rounded-2xl shadow-button" />
        <Loader2 className="mx-auto mt-5 h-5 w-5 animate-spin text-kaem-600" />
        <p className="mt-2 text-sm text-slate-500">Menyiapkan workspace...</p>
      </div>
    </div>
  );
}

function Login() {
  const { setUser, loadData } = useAppStore();
  const [loading, setLoading] = useState<"cloud" | "password" | "local" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function loginCloud() {
    setLoading("cloud");
    setError("");
    try {
      const result = await api.auth.login();
      if (!result.configured) {
        setError("Supabase belum dikonfigurasi. Gunakan mode lokal untuk melanjutkan.");
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login gagal.");
    } finally {
      setLoading(null);
    }
  }

  async function loginPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("password");
    setError("");
    try {
      const user = await api.auth.password(email, password);
      setUser(user);
      await loadData();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login gagal.");
    } finally {
      setLoading(null);
    }
  }

  async function loginLocal() {
    setLoading("local");
    setError("");
    try {
      const user = await api.auth.local();
      setUser(user);
      await loadData();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Mode lokal gagal dibuka.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-6">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-kaem-200/60 blur-3xl" />
      <div className="absolute -bottom-40 -right-28 h-[28rem] w-[28rem] rounded-full bg-kaem-100 blur-3xl" />
      <Card className="relative w-full max-w-md overflow-hidden border-0 shadow-form">
        <div className="h-1.5 bg-gradient-to-r from-kaem-400 via-kaem-600 to-kaem-800" />
        <div className="p-8">
          <div className="flex items-center gap-3">
            <KaemFormLogo className="h-12 w-12 rounded-2xl shadow-button" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">KaemForm Desktop</h1>
              <p className="text-sm text-slate-500">Workspace dokumen administrasi</p>
            </div>
          </div>
          <div className="my-7 h-px bg-slate-100" />
          <h2 className="text-lg font-bold text-slate-900">Masuk ke workspace</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Sinkronkan data KaemForm atau lanjutkan dengan data lokal di komputer ini.
          </p>
          <div className="mt-6 space-y-3">
            <Button
              size="lg"
              className="w-full"
              loading={loading === "cloud"}
              onClick={loginCloud}
            >
              <Cloud className="h-5 w-5" />
              Masuk dengan Google
            </Button>
            <div className="flex items-center gap-3 py-1 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              atau gunakan akun KaemForm Web
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <form className="space-y-3" onSubmit={loginPassword}>
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                required
              />
              <Input
                type="password"
                label="Kata sandi"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete="current-password"
                minLength={8}
                required
              />
              <Button
                type="submit"
                size="lg"
                variant="secondary"
                className="w-full"
                loading={loading === "password"}
              >
                Masuk dengan Email
              </Button>
            </form>
            <Button
              size="lg"
              variant="ghost"
              className="w-full"
              loading={loading === "local"}
              onClick={loginLocal}
            >
              <Database className="h-5 w-5" />
              Gunakan Mode Lokal
            </Button>
          </div>
          {error && (
            <div className="mt-4 rounded-input border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {error}
            </div>
          )}
          {usingMockApi && (
            <p className="mt-5 text-center text-xs text-slate-400">
              Mode preview aktif. Data contoh akan digunakan.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navigation: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/generate", label: "Generate", icon: FileOutput },
  { to: "/templates", label: "Template", icon: FileText },
  { to: "/data", label: "Data", icon: Database },
  { to: "/rekap", label: "Rekap", icon: BarChart3 },
  { to: "/history", label: "Riwayat", icon: History },
];

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { syncStatus } = useAppStore();

  return (
    <div className="flex h-screen bg-slate-50">
      <aside
        className={cn(
          "flex shrink-0 flex-col bg-kaem-900 text-white transition-[width] duration-200",
          collapsed ? "w-[72px]" : "w-[224px]"
        )}
      >
        <div className="flex h-[72px] items-center border-b border-white/10 px-4">
          <KaemFormLogo className="h-10 w-10 rounded-xl ring-1 ring-white/20" />
          {!collapsed && (
            <div className="ml-3 min-w-0">
              <p className="truncate font-bold">KaemForm</p>
              <p className="text-[11px] text-kaem-200">Desktop</p>
            </div>
          )}
          <button
            className={cn(
              "ml-auto rounded-lg p-2 text-kaem-200 hover:bg-white/10 hover:text-white",
              collapsed && "absolute left-[76px] top-4 z-10 bg-kaem-900 shadow-lg"
            )}
            title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigation.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
          <div className="my-4 border-t border-white/10" />
          <SidebarLink
            item={{ to: "/settings", label: "Pengaturan", icon: Settings }}
            collapsed={collapsed}
          />
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            className={cn(
              "flex h-10 w-full items-center rounded-lg border border-kaem-600 text-sm font-semibold text-kaem-100 transition-colors hover:bg-kaem-800",
              collapsed ? "justify-center px-0" : "gap-2 px-3"
            )}
            title="Buka Workspace Web"
            onClick={() => api.external.open("https://form.kaemnur.com/app")}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Buka Workspace</span>}
          </button>
          <div
            className={cn(
              "mt-3 flex items-center text-[11px] text-kaem-200",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            <span className="flex items-center gap-2" title={syncStatus.error ?? undefined}>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  syncStatus.error
                    ? "bg-amber-400"
                    : syncStatus.isSyncing
                      ? "animate-pulse bg-sky-300"
                      : "bg-emerald-400"
                )}
              />
              {!collapsed &&
                (syncStatus.isSyncing
                  ? "Sinkronisasi..."
                  : `Tersinkron ${timeAgo(syncStatus.lastSynced)}`)}
            </span>
            {!collapsed && <span>v1.0.0</span>}
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1440px] p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/rekap" element={<Rekap />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "flex h-10 items-center rounded-lg text-sm transition-colors",
          collapsed ? "justify-center px-0" : "gap-3 px-3",
          isActive
            ? "bg-kaem-700 font-semibold text-white"
            : "text-kaem-100 hover:bg-kaem-800 hover:text-white"
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, workspaces, forms, templates, history, settings, syncStatus, loadData } =
    useAppStore();
  const workspace =
    workspaces.find((item) => item.id === settings?.active_workspace) ?? workspaces[0];

  async function uploadTemplate() {
    const result = await api.templates.upload();
    if (result) await loadData();
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Dashboard"
        title={`Selamat datang, ${user?.name ?? "Pengguna"}`}
        description="Kelola template, data, dan hasil dokumen dari satu workspace."
        action={
          <Button
            variant="secondary"
            loading={syncStatus.isSyncing}
            onClick={async () => {
              const status = await api.sync.start();
              useAppStore.getState().setSyncStatus(status);
              await loadData();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Sinkronkan
          </Button>
        }
      />

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-kaem-800 to-kaem-600 text-white shadow-form">
        <div className="flex items-center justify-between gap-8 p-7">
          <div>
            <p className="text-sm font-medium text-kaem-100">Workspace aktif</p>
            <h2 className="mt-1 text-2xl font-bold">{workspace?.name ?? "Workspace Lokal"}</h2>
            <p className="mt-2 text-sm text-kaem-100">
              {syncStatus.error ??
                `Terakhir tersinkron ${timeAgo(syncStatus.lastSynced ?? settings?.last_synced)}`}
            </p>
          </div>
          <div className="flex gap-3">
            <Metric label="Form" value={workspace?.form_count ?? forms.length} />
            <Metric
              label="Respons"
              value={
                workspace?.response_count ??
                forms.reduce((sum, form) => sum + form.response_count, 0)
              }
            />
            <Metric label="Template" value={templates.length} />
          </div>
        </div>
      </Card>

      <section>
        <h2 className="mb-4 text-base font-bold text-slate-900">Aksi cepat</h2>
        <div className="grid grid-cols-3 gap-4">
          <QuickAction
            icon={WandSparkles}
            title="Generate Dokumen"
            description="Buat dokumen Word atau PDF secara massal."
            onClick={() => navigate("/generate")}
          />
          <QuickAction
            icon={Upload}
            title="Upload Template"
            description="Tambahkan template .docx dan deteksi placeholder."
            onClick={uploadTemplate}
          />
          <QuickAction
            icon={FileSpreadsheet}
            title="Buat Rekap"
            description="Susun data menjadi file Excel yang rapi."
            onClick={() => navigate("/rekap")}
          />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Aktivitas terakhir</h2>
          <button
            className="text-sm font-semibold text-kaem-600 hover:text-kaem-700"
            onClick={() => navigate("/history")}
          >
            Lihat semua
          </button>
        </div>
        {history.length ? (
          <Card className="divide-y divide-slate-100">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="grid h-10 w-10 place-items-center rounded-input bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.template_name ?? "Dokumen"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {item.record_count} output · {formatDate(item.created_at)}
                  </p>
                </div>
                <Badge variant={item.status === "completed" ? "success" : "warning"}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </Card>
        ) : (
          <EmptyState
            icon={<History className="h-6 w-6" />}
            title="Belum ada aktivitas"
            description="Riwayat dokumen yang dibuat akan tampil di sini."
            action={<Button onClick={() => navigate("/generate")}>Generate pertama</Button>}
          />
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[92px] rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-kaem-100">{label}</p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer p-5 transition-all hover:-translate-y-px hover:border-kaem-200 hover:shadow-card-hover"
      onClick={onClick}
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-kaem-50 text-kaem-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </Card>
  );
}

function Templates() {
  const { templates, loadData } = useAppStore();
  const [preview, setPreview] = useState<{ title: string; html: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file?: File) {
    setBusy(true);
    try {
      const filePath = file ? api.external.filePath(file) : undefined;
      const result = await api.templates.upload(filePath || undefined);
      if (result) await loadData();
    } finally {
      setBusy(false);
    }
  }

  async function openPreview(template: TemplateRecord) {
    const html = await api.templates.preview(template.id);
    setPreview({ title: template.name, html });
  }

  async function remove(template: TemplateRecord) {
    if (!window.confirm(`Hapus template "${template.name}"?`)) return;
    await api.templates.delete(template.id);
    await loadData();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dokumen"
        title="Template Word"
        description="Upload file .docx dengan placeholder seperti {{nama}} atau {{nip}}."
        action={
          <Button loading={busy} onClick={() => upload()}>
            <Upload className="h-4 w-4" /> Upload Template
          </Button>
        }
      />
      <DragDropZone
        accept=".docx"
        label="Seret file .docx ke sini"
        hint="atau klik untuk memilih template Word"
        onFile={upload}
      />
      {templates.length ? (
        <div className="grid grid-cols-2 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => openPreview(template)}
              onDelete={() => remove(template)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FilePlus2 className="h-6 w-6" />}
          title="Belum ada template"
          description="Upload file .docx untuk mulai membuat dokumen otomatis."
          action={<Button onClick={() => upload()}>Upload Template</Button>}
        />
      )}
      <Modal open={Boolean(preview)} title={preview?.title ?? "Preview"} onClose={() => setPreview(null)}>
        <div
          className="overflow-hidden rounded-input border border-slate-200 shadow-sm"
          dangerouslySetInnerHTML={{ __html: preview?.html ?? "" }}
        />
      </Modal>
    </div>
  );
}

const generateSteps = ["Template", "Sumber Data", "Mapping", "Preview", "Generate"];

function Generate() {
  const navigate = useNavigate();
  const { templates, forms, importedFiles, loadData, settings } = useAppStore();
  const generate = useGenerateStore();
  const [sourceTab, setSourceTab] = useState<DataSource>(generate.dataSource);
  const [manualRecord, setManualRecord] = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [error, setError] = useState("");
  const selectedTemplate = templates.find((item) => item.id === generate.templateId);
  const columns = useMemo(
    () => [...new Set(generate.records.flatMap((record) => Object.keys(record)))],
    [generate.records]
  );
  const allMapped =
    Boolean(selectedTemplate?.placeholders.length) &&
    selectedTemplate!.placeholders.every((placeholder) => generate.mapping[placeholder]);

  useEffect(
    () =>
      api.generate.onProgress((progress) => {
        useGenerateStore.getState().set({ progress });
      }),
    []
  );

  useEffect(() => {
    setSourceTab(generate.dataSource);
  }, [generate.dataSource]);

  useEffect(() => {
    if (generate.step !== 4 || !selectedTemplate || !generate.records.length) return;
    api.templates
      .preview(selectedTemplate.id, generate.records[previewIndex], generate.mapping)
      .then(setPreviewHtml)
      .catch((previewError) =>
        setError(previewError instanceof Error ? previewError.message : "Preview gagal.")
      );
  }, [
    generate.step,
    generate.mapping,
    generate.records,
    previewIndex,
    selectedTemplate,
  ]);

  async function selectForm(form: FormRecord) {
    const responses = await api.sync.responses(form.id);
    const records = responsesToRows(form, responses);
    generate.set({
      dataSource: "kaemform",
      sourceId: form.id,
      records,
      mapping: selectedTemplate ? autoMap(selectedTemplate.placeholders, Object.keys(records[0] ?? {})) : {},
    });
  }

  function selectFile(file: ImportedFileRecord) {
    generate.set({
      dataSource: "excel",
      sourceId: file.id,
      records: file.rows,
      mapping: selectedTemplate ? autoMap(selectedTemplate.placeholders, file.headers) : {},
    });
  }

  async function importExcel(file?: File) {
    const filePath = file ? api.external.filePath(file) : undefined;
    const imported = await api.excel.import(filePath || undefined);
    if (!imported) return;
    await loadData();
    selectFile(imported);
  }

  async function runGenerate() {
    if (!selectedTemplate || !generate.records.length) return;
    setError("");
    generate.set({ isGenerating: true, result: null });
    try {
      const result = await api.generate.start({
        templateId: selectedTemplate.id,
        records: generate.records,
        mapping: generate.mapping,
        outputFormats: generate.outputFormats,
        outputPath: settings?.output_path,
        dataSource: `${generate.dataSource}:${generate.sourceId ?? "manual"}`,
      });
      generate.set({ isGenerating: false, result });
      await loadData();
    } catch (generateError) {
      generate.set({ isGenerating: false });
      setError(generateError instanceof Error ? generateError.message : "Generate gagal.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mail merge"
        title="Generate Dokumen"
        description="Pilih template dan data, petakan kolom, lalu buat dokumen secara massal."
        action={
          generate.step > 1 && !generate.isGenerating ? (
            <Button variant="ghost" onClick={generate.reset}>
              <RotateCcw className="h-4 w-4" /> Mulai ulang
            </Button>
          ) : undefined
        }
      />
      <Card className="p-5">
        <div className="flex items-center">
          {generateSteps.map((label, index) => {
            const step = index + 1;
            const active = generate.step === step;
            const done = generate.step > step;
            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-full text-xs font-bold",
                      done && "bg-emerald-500 text-white",
                      active && "bg-kaem-600 text-white shadow-button",
                      !active && !done && "bg-slate-100 text-slate-400"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : step}
                  </span>
                  <span
                    className={cn(
                      "hidden text-xs font-semibold xl:inline",
                      active ? "text-kaem-700" : "text-slate-400"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {step < 5 && (
                  <div className={cn("mx-3 h-px flex-1", done ? "bg-emerald-300" : "bg-slate-200")} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {error && (
        <div className="rounded-input border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {generate.step > 1 && !selectedTemplate && (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="Pilih template untuk melanjutkan"
          description="Sumber data yang sudah dipilih tetap disimpan. Pilih template agar mapping dan preview dapat dibuat."
          action={
            <Button onClick={() => generate.set({ step: 1 })}>
              <ArrowLeft className="h-4 w-4" /> Pilih Template
            </Button>
          }
        />
      )}

      {generate.step === 1 && (
        <section>
          <h2 className="mb-4 font-bold text-slate-900">1. Pilih template</h2>
          {templates.length ? (
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={generate.templateId === template.id}
                  onSelect={() =>
                    generate.set({
                      templateId: template.id,
                      mapping: generate.records.length
                        ? autoMap(
                            template.placeholders,
                            Object.keys(generate.records[0] ?? {})
                          )
                        : {},
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="Template belum tersedia"
              description="Upload template terlebih dahulu sebelum membuat dokumen."
              action={<Button onClick={() => navigate("/templates")}>Buka Template</Button>}
            />
          )}
          <WizardFooter
            nextDisabled={!generate.templateId}
            onNext={generate.next}
          />
        </section>
      )}

      {generate.step === 2 && selectedTemplate && (
        <section>
          <h2 className="mb-4 font-bold text-slate-900">2. Pilih sumber data</h2>
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              { id: "kaemform" as const, label: "KaemForm", icon: Cloud },
              { id: "excel" as const, label: "Excel / CSV", icon: FileSpreadsheet },
              { id: "manual" as const, label: "Input Manual", icon: CircleUserRound },
            ].map((item) => (
              <button
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-card border p-4 text-left transition-colors",
                  sourceTab === item.id
                    ? "border-kaem-400 bg-kaem-50 text-kaem-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-kaem-200"
                )}
                onClick={() => {
                  setSourceTab(item.id);
                  generate.set({ dataSource: item.id, sourceId: null, records: [], mapping: {} });
                }}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-bold">{item.label}</span>
              </button>
            ))}
          </div>

          {sourceTab === "kaemform" && (
            <div className="grid grid-cols-2 gap-3">
              {forms.length ? (
                forms.map((form) => (
                  <SourceCard
                    key={form.id}
                    active={generate.sourceId === form.id}
                    title={form.title}
                    meta={`${form.response_count} respons`}
                    icon={<Cloud className="h-5 w-5" />}
                    onClick={() => selectForm(form)}
                  />
                ))
              ) : (
                <div className="col-span-2">
                  <EmptyState
                    icon={<Cloud className="h-6 w-6" />}
                    title="Belum ada data KaemForm"
                    description="Sinkronkan workspace atau gunakan Excel dan input manual."
                  />
                </div>
              )}
            </div>
          )}

          {sourceTab === "excel" && (
            <div className="space-y-4">
              <DragDropZone
                accept=".xlsx,.xls,.csv"
                label="Import Excel atau CSV"
                hint="kolom dan data akan dideteksi otomatis"
                onFile={importExcel}
              />
              {importedFiles.map((file) => (
                <SourceCard
                  key={file.id}
                  active={generate.sourceId === file.id}
                  title={file.name}
                  meta={`${file.rows.length} baris · ${file.headers.length} kolom`}
                  icon={<FileSpreadsheet className="h-5 w-5" />}
                  onClick={() => selectFile(file)}
                />
              ))}
            </div>
          )}

          {sourceTab === "manual" && (
            <Card className="p-5">
              <div className="grid grid-cols-2 gap-4">
                {selectedTemplate.placeholders.map((placeholder) => (
                  <Input
                    key={placeholder}
                    label={placeholder}
                    value={manualRecord[placeholder] ?? ""}
                    placeholder={`Isi ${placeholder}`}
                    onChange={(event) =>
                      setManualRecord((value) => ({
                        ...value,
                        [placeholder]: event.target.value,
                      }))
                    }
                  />
                ))}
              </div>
              <Button
                className="mt-5"
                onClick={() => {
                  const record = { ...manualRecord };
                  generate.set({
                    dataSource: "manual",
                    sourceId: "manual",
                    records: [record],
                    mapping: Object.fromEntries(
                      selectedTemplate.placeholders.map((placeholder) => [
                        placeholder,
                        placeholder,
                      ])
                    ),
                  });
                }}
              >
                <Check className="h-4 w-4" /> Gunakan Data Ini
              </Button>
            </Card>
          )}

          {generate.records.length > 0 && (
            <div className="mt-5 rounded-input border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {generate.records.length} data siap digunakan.
            </div>
          )}
          <WizardFooter
            onBack={generate.back}
            onNext={generate.next}
            nextDisabled={!generate.records.length}
          />
        </section>
      )}

      {generate.step === 3 && selectedTemplate && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">3. Mapping placeholder</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                generate.set({ mapping: autoMap(selectedTemplate.placeholders, columns) })
              }
            >
              <Sparkles className="h-4 w-4" /> Auto-map
            </Button>
          </div>
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_100px] bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              <span>Placeholder</span>
              <span>Kolom Data</span>
              <span>Status</span>
            </div>
            {selectedTemplate.placeholders.map((placeholder) => {
              const mapped = generate.mapping[placeholder];
              return (
                <div
                  key={placeholder}
                  className="grid grid-cols-[1fr_1fr_100px] items-center gap-4 border-t border-slate-100 px-5 py-4"
                >
                  <code className="text-sm font-semibold text-kaem-700">{`{{${placeholder}}}`}</code>
                  <Select
                    value={mapped ?? ""}
                    onChange={(event) =>
                      generate.set({
                        mapping: {
                          ...generate.mapping,
                          [placeholder]: event.target.value,
                        },
                      })
                    }
                  >
                    <option value="">Pilih kolom...</option>
                    {columns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </Select>
                  {mapped ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Terpetakan
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                      <XCircle className="h-4 w-4" /> Kosong
                    </span>
                  )}
                </div>
              );
            })}
          </Card>
          <WizardFooter
            onBack={generate.back}
            onNext={generate.next}
            nextDisabled={!allMapped}
          />
        </section>
      )}

      {generate.step === 4 && selectedTemplate && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">4. Preview dokumen</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Button
                variant="ghost"
                size="sm"
                disabled={previewIndex === 0}
                onClick={() => setPreviewIndex((value) => value - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {previewIndex + 1} dari {generate.records.length}
              <Button
                variant="ghost"
                size="sm"
                disabled={previewIndex === generate.records.length - 1}
                onClick={() => setPreviewIndex((value) => value + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden">
            {previewHtml ? (
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <div className="grid h-[420px] place-items-center">
                <Loader2 className="h-6 w-6 animate-spin text-kaem-600" />
              </div>
            )}
          </Card>
          <WizardFooter onBack={generate.back} onNext={generate.next} nextLabel="Lanjut Generate" />
        </section>
      )}

      {generate.step === 5 && selectedTemplate && (
        <section>
          <h2 className="mb-4 font-bold text-slate-900">5. Generate dokumen</h2>
          {generate.result ? (
            <Card className="p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {generate.result.success} dokumen berhasil dibuat
              </h3>
              <p className="mt-2 text-sm text-slate-500">{generate.result.outputPath}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => api.generate.openFolder(generate.result!.outputPath)}>
                  <FolderOpen className="h-4 w-4" /> Buka Folder
                </Button>
                <Button variant="secondary" onClick={generate.reset}>
                  <RotateCcw className="h-4 w-4" /> Generate Lagi
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-slate-800">Format output</p>
                  <div className="mt-3 flex gap-3">
                    {(["docx", "pdf"] as const).map((format) => {
                      const checked = generate.outputFormats.includes(format);
                      return (
                        <button
                          key={format}
                          className={cn(
                            "flex flex-1 items-center gap-3 rounded-input border p-4 text-sm font-bold uppercase",
                            checked
                              ? "border-kaem-400 bg-kaem-50 text-kaem-700"
                              : "border-slate-200 text-slate-500"
                          )}
                          disabled={generate.isGenerating}
                          onClick={() => {
                            const next = checked
                              ? generate.outputFormats.filter((item) => item !== format)
                              : [...generate.outputFormats, format];
                            if (next.length) generate.set({ outputFormats: next });
                          }}
                        >
                          <span
                            className={cn(
                              "grid h-5 w-5 place-items-center rounded border",
                              checked ? "border-kaem-600 bg-kaem-600 text-white" : "border-slate-300"
                            )}
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                          {format}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Folder output</p>
                  <div className="mt-3 flex h-[54px] items-center gap-3 rounded-input border border-slate-200 bg-slate-50 px-4">
                    <FolderOpen className="h-5 w-5 shrink-0 text-kaem-600" />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-600">
                      {settings?.output_path || "Folder output default"}
                    </span>
                  </div>
                </div>
              </div>
              {generate.isGenerating && (
                <div className="mt-7 rounded-card bg-slate-50 p-5">
                  <ProgressBar
                    value={
                      generate.progress.total
                        ? (generate.progress.current / generate.progress.total) * 100
                        : 0
                    }
                    label={`${generate.progress.current}/${generate.progress.total} · ${generate.progress.filename}`}
                  />
                </div>
              )}
              <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                <Button variant="ghost" disabled={generate.isGenerating} onClick={generate.back}>
                  <ArrowLeft className="h-4 w-4" /> Kembali
                </Button>
                {generate.isGenerating ? (
                  <Button variant="danger" onClick={() => api.generate.cancel()}>
                    Batalkan
                  </Button>
                ) : (
                  <Button onClick={runGenerate}>
                    <Play className="h-4 w-4" />
                    Generate {generate.records.length} Dokumen
                  </Button>
                )}
              </div>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}

function WizardFooter({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Lanjut",
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-6 flex justify-between">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
      ) : (
        <span />
      )}
      <Button disabled={nextDisabled} onClick={onNext}>
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SourceCard({
  active,
  title,
  meta,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  meta: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-4 rounded-card border bg-white p-4 text-left transition-all",
        active
          ? "border-kaem-400 ring-2 ring-kaem-100"
          : "border-slate-200 hover:border-kaem-200"
      )}
      onClick={onClick}
    >
      <div className="grid h-10 w-10 place-items-center rounded-input bg-kaem-50 text-kaem-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{meta}</p>
      </div>
      {active && <CheckCircle2 className="ml-auto h-5 w-5 text-kaem-600" />}
    </button>
  );
}

function DataPage() {
  const navigate = useNavigate();
  const { forms, importedFiles, loadData } = useAppStore();
  const [tab, setTab] = useState<"cloud" | "local">("cloud");
  const [selectedForm, setSelectedForm] = useState<FormRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<ImportedFileRecord | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  async function openForm(form: FormRecord) {
    setSelectedForm(form);
    const responses = await api.sync.responses(form.id);
    setRows(responsesToRows(form, responses));
  }

  async function importFile(file?: File) {
    const path = file ? api.external.filePath(file) : undefined;
    const imported = await api.excel.import(path || undefined);
    if (imported) {
      await loadData();
      setSelectedFile(imported);
      setRows(imported.rows);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sumber"
        title="Data"
        description="Lihat respons KaemForm atau data Excel yang tersimpan secara lokal."
        action={
          tab === "local" ? (
            <Button onClick={() => importFile()}>
              <Upload className="h-4 w-4" /> Import Excel
            </Button>
          ) : undefined
        }
      />
      <div className="inline-flex rounded-input bg-slate-200/70 p-1">
        <TabButton active={tab === "cloud"} onClick={() => setTab("cloud")}>
          KaemForm
        </TabButton>
        <TabButton active={tab === "local"} onClick={() => setTab("local")}>
          Lokal
        </TabButton>
      </div>

      {tab === "cloud" ? (
        <div className="grid grid-cols-[320px_1fr] gap-5">
          <Card className="h-fit divide-y divide-slate-100 overflow-hidden">
            {forms.length ? (
              forms.map((form) => (
                <button
                  key={form.id}
                  className={cn(
                    "w-full px-4 py-4 text-left hover:bg-kaem-50",
                    selectedForm?.id === form.id && "bg-kaem-50"
                  )}
                  onClick={() => openForm(form)}
                >
                  <p className="text-sm font-bold text-slate-800">{form.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{form.response_count} respons</p>
                </button>
              ))
            ) : (
              <p className="p-5 text-sm text-slate-500">Belum ada form tersinkron.</p>
            )}
          </Card>
          <DataPreview
            rows={rows}
            emptyTitle="Pilih form"
            action={
              selectedForm ? (
                <Button
                  size="sm"
                  onClick={() => {
                    const store = useGenerateStore.getState();
                    store.reset();
                    store.set({
                      step: 1,
                      dataSource: "kaemform",
                      sourceId: selectedForm.id,
                      records: rows,
                    });
                    navigate("/generate");
                  }}
                >
                  Gunakan untuk Generate
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          <DragDropZone
            accept=".xlsx,.xls,.csv"
            label="Seret file Excel atau CSV"
            onFile={importFile}
          />
          <div className="grid grid-cols-[320px_1fr] gap-5">
            <Card className="h-fit divide-y divide-slate-100 overflow-hidden">
              {importedFiles.map((file) => (
                <button
                  key={file.id}
                  className={cn(
                    "w-full px-4 py-4 text-left hover:bg-kaem-50",
                    selectedFile?.id === file.id && "bg-kaem-50"
                  )}
                  onClick={() => {
                    setSelectedFile(file);
                    setRows(file.rows);
                  }}
                >
                  <p className="truncate text-sm font-bold text-slate-800">{file.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{file.rows.length} baris</p>
                </button>
              ))}
            </Card>
            <DataPreview rows={rows} emptyTitle="Pilih file lokal" />
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "rounded-lg px-5 py-2 text-sm font-semibold transition-all",
        active ? "bg-white text-kaem-700 shadow-sm" : "text-slate-500"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DataPreview({
  rows,
  emptyTitle,
  action,
}: {
  rows: Record<string, unknown>[];
  emptyTitle: string;
  action?: ReactNode;
}) {
  if (!rows.length) {
    return (
      <EmptyState
        icon={<Database className="h-6 w-6" />}
        title={emptyTitle}
        description="Data akan ditampilkan dalam tabel di area ini."
      />
    );
  }
  return (
    <div>
      {action && <div className="mb-4 flex justify-end">{action}</div>}
      <DataTable rows={rows} />
    </div>
  );
}

function Rekap() {
  const { forms, importedFiles } = useAppStore();
  const [source, setSource] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [title, setTitle] = useState("Rekap Data");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [result, setResult] = useState<{ filePath: string; folderPath: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function chooseSource(value: string) {
    setSource(value);
    setResult(null);
    if (value.startsWith("form:")) {
      const form = forms.find((item) => item.id === value.slice(5));
      if (!form) return;
      const responses = await api.sync.responses(form.id);
      const nextRows = responsesToRows(form, responses);
      const nextColumns = Object.keys(nextRows[0] ?? {});
      setRows(nextRows);
      setColumns(nextColumns);
      setSelectedColumns(nextColumns);
      setSourceName(form.title);
      setTitle(`Rekap ${form.title}`);
    } else if (value.startsWith("file:")) {
      const file = importedFiles.find((item) => item.id === value.slice(5));
      if (!file) return;
      setRows(file.rows);
      setColumns(file.headers);
      setSelectedColumns(file.headers);
      setSourceName(file.name);
      setTitle(`Rekap ${file.name.replace(/\.[^.]+$/, "")}`);
    }
  }

  async function generateRecap() {
    setBusy(true);
    try {
      const generated = await api.excel.generateRekap({
        title,
        sourceName,
        rows,
        columns: selectedColumns,
      });
      setResult(generated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Spreadsheet"
        title="Buat Rekap Excel"
        description="Pilih sumber data dan kolom yang akan dimasukkan ke file rekap."
      />
      <div className="grid grid-cols-[360px_1fr] gap-5">
        <Card className="h-fit p-5">
          <div className="space-y-4">
            <Select label="Sumber data" value={source} onChange={(event) => chooseSource(event.target.value)}>
              <option value="">Pilih data...</option>
              <optgroup label="KaemForm">
                {forms.map((form) => (
                  <option key={form.id} value={`form:${form.id}`}>
                    {form.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="File lokal">
                {importedFiles.map((file) => (
                  <option key={file.id} value={`file:${file.id}`}>
                    {file.name}
                  </option>
                ))}
              </optgroup>
            </Select>
            <Input label="Judul rekap" value={title} onChange={(event) => setTitle(event.target.value)} />
            {columns.length > 0 && (
              <div>
                <p className="mb-2 text-[13px] font-semibold text-slate-700">Kolom</p>
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-input border border-slate-200 p-2">
                  {columns.map((column) => {
                    const checked = selectedColumns.includes(column);
                    return (
                      <label
                        key={column}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedColumns((value) =>
                              checked ? value.filter((item) => item !== column) : [...value, column]
                            )
                          }
                        />
                        <span className="truncate">{column}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <Button
              className="w-full"
              loading={busy}
              disabled={!rows.length || !selectedColumns.length}
              onClick={generateRecap}
            >
              <FileSpreadsheet className="h-4 w-4" /> Generate Rekap
            </Button>
          </div>
        </Card>
        <div>
          {result && (
            <div className="mb-4 flex items-center justify-between rounded-card border border-emerald-200 bg-emerald-50 p-4">
              <div>
                <p className="text-sm font-bold text-emerald-800">Rekap berhasil dibuat</p>
                <p className="mt-1 text-xs text-emerald-600">{result.filePath}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => api.external.openPath(result.filePath)}>
                  Buka File
                </Button>
                <Button size="sm" onClick={() => api.external.openPath(result.folderPath)}>
                  Buka Folder
                </Button>
              </div>
            </div>
          )}
          <DataPreview rows={rows} emptyTitle="Pilih sumber data" />
        </div>
      </div>
    </div>
  );
}

function HistoryPage() {
  const navigate = useNavigate();
  const { history } = useAppStore();
  const [selected, setSelected] = useState<HistoryRecord | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Arsip"
        title="Riwayat Generate"
        description="Lihat hasil dokumen terdahulu dan buka kembali folder output."
      />
      {history.length ? (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Template</th>
                <th className="px-5 py-3">Sumber</th>
                <th className="px-5 py-3">Output</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-500">{formatDate(item.created_at)}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {item.template_name ?? "Template"}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{item.data_source}</td>
                  <td className="px-5 py-4 text-slate-500">{item.record_count}</td>
                  <td className="px-5 py-4">
                    <Badge variant={item.status === "completed" ? "success" : "warning"}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(item)}>
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState
          icon={<Archive className="h-6 w-6" />}
          title="Riwayat masih kosong"
          description="Dokumen yang selesai dibuat akan tercatat otomatis."
          action={<Button onClick={() => navigate("/generate")}>Generate Dokumen</Button>}
        />
      )}
      <Modal open={Boolean(selected)} title="Detail Riwayat" onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Template" value={selected.template_name ?? selected.template_id} />
              <Detail label="Jumlah output" value={String(selected.record_count)} />
              <Detail label="Format" value={selected.output_formats.join(", ").toUpperCase()} />
              <Detail label="Tanggal" value={formatDate(selected.created_at)} />
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Mapping</p>
              <div className="rounded-input bg-slate-50 p-3 text-sm">
                {Object.entries(selected.mapping).map(([placeholder, column]) => (
                  <div key={placeholder} className="flex justify-between border-b border-slate-200 py-2 last:border-0">
                    <span className="font-medium text-slate-700">{placeholder}</span>
                    <span className="text-slate-500">{column}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={() => api.history.openFolder(selected.output_path)}>
              <FolderOpen className="h-4 w-4" /> Buka Folder Output
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-input bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function SettingsPage() {
  const { user, workspaces, settings, syncStatus, updateSettings, setUser, loadData } =
    useAppStore();
  const [busy, setBusy] = useState(false);

  async function syncNow() {
    setBusy(true);
    try {
      const status = await api.sync.start();
      useAppStore.getState().setSyncStatus(status);
      await loadData();
    } finally {
      setBusy(false);
    }
  }

  async function chooseOutput() {
    const path = await api.settings.chooseOutput();
    if (path) await updateSettings({ output_path: path });
  }

  async function logout() {
    await api.auth.logout();
    setUser(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Konfigurasi"
        title="Pengaturan"
        description="Atur akun, workspace, folder output, dan sinkronisasi."
      />
      <SettingsSection title="Akun" icon={<CircleUserRound className="h-5 w-5" />}>
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-kaem-100 font-bold text-kaem-700">
            {user?.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          <Button variant="secondary" onClick={logout}>
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Workspace" icon={<Database className="h-5 w-5" />}>
        <Select
          label="Workspace aktif"
          value={settings?.active_workspace ?? ""}
          onChange={(event) => updateSettings({ active_workspace: event.target.value })}
        >
          <option value="">Workspace Lokal</option>
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </Select>
      </SettingsSection>

      <SettingsSection title="Folder Output" icon={<FolderOpen className="h-5 w-5" />}>
        <div className="flex items-end gap-3">
          <Input className="flex-1" label="Lokasi penyimpanan" readOnly value={settings?.output_path ?? ""} />
          <Button variant="secondary" onClick={chooseOutput}>
            Ubah
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Sinkronisasi" icon={<RefreshCw className="h-5 w-5" />}>
        <div className="flex items-end gap-3">
          <Select
            className="w-44"
            label="Interval"
            value={settings?.sync_interval ?? "5"}
            onChange={(event) => updateSettings({ sync_interval: event.target.value })}
          >
            <option value="1">Setiap 1 menit</option>
            <option value="5">Setiap 5 menit</option>
            <option value="15">Setiap 15 menit</option>
          </Select>
          <div className="min-w-0 flex-1 pb-2 text-sm text-slate-500">
            Terakhir sinkron: {formatDate(syncStatus.lastSynced ?? settings?.last_synced)}
          </div>
          <Button loading={busy} onClick={syncNow}>
            <RefreshCw className="h-4 w-4" /> Sinkronkan Sekarang
          </Button>
        </div>
        {syncStatus.error && <p className="mt-3 text-sm text-amber-600">{syncStatus.error}</p>}
      </SettingsSection>

      <SettingsSection title="Tentang" icon={<Sparkles className="h-5 w-5" />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">KaemForm Desktop v1.0.0</p>
            <p className="mt-1 text-sm text-slate-500">Workspace administrasi oleh Kaemnur.</p>
          </div>
          <Button variant="ghost" onClick={() => api.external.open("https://kaemnur.com")}>
            kaemnur.com <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="grid h-9 w-9 place-items-center rounded-input bg-kaem-50 text-kaem-600">
          {icon}
        </div>
        <h2 className="font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export default function App() {
  const { initialized, user, initialize, setUser, loadData, setSyncStatus } = useAppStore();
  const [startupError, setStartupError] = useState("");

  useEffect(() => {
    initialize().catch((error) => {
      setStartupError(error instanceof Error ? error.message : "Aplikasi gagal diinisialisasi.");
    });
    const offAuth = api.auth.onChanged((nextUser) => {
      setUser(nextUser);
      if (nextUser) void loadData();
    });
    const offSync = api.sync.onStatus((status) => {
      setSyncStatus(status);
      if (!status.isSyncing && !status.error) void loadData();
    });
    return () => {
      offAuth();
      offSync();
    };
  }, [initialize, loadData, setSyncStatus, setUser]);

  if (startupError) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-8">
        <Card className="max-w-lg p-7 text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-lg font-bold text-slate-900">Aplikasi gagal dimuat</h1>
          <p className="mt-2 text-sm text-slate-500">{startupError}</p>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            Muat Ulang
          </Button>
        </Card>
      </div>
    );
  }
  if (!initialized) return <LoadingScreen />;
  if (!user) return <Login />;
  return <AppShell />;
}
