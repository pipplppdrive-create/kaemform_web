# Prompt KaemForm Desktop

Referensi: baca semua file berikut sebelum mulai:
- docs/DESKTOP-PRD.md → fitur, flow, file structure output
- docs/DESKTOP-ARCHITECTURE.md → project structure, IPC, SQLite schema, engine specs
- docs/UI-REDESIGN.md → warna kaem, design system (sama dengan web)

Project lokasi: `C:\Users\kaemn\OneDrive\Desktop\PROJECTS\KaemForm\apps\desktop`
Web lokasi (untuk referensi): `C:\Users\kaemn\OneDrive\Desktop\PROJECTS\KaemForm\apps\web`

---

## A. Project Setup

Buat Electron app di apps/desktop/ menggunakan electron-vite (https://electron-vite.org):

```bash
npm create @electron-vite/create apps/desktop -- --template react-ts
```

Install dependencies:
- **Main process:** better-sqlite3, docxtemplater, pizzip, exceljs, @supabase/supabase-js, nanoid
- **Renderer:** react, react-dom, tailwindcss, zustand, lucide-react (icons), @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-toast, @radix-ui/react-tabs

Setup Tailwind config dengan warna kaem identik docs/UI-REDESIGN.md. Font Inter.

Buat SQLite database init di main process: jalankan semua CREATE TABLE dari docs/DESKTOP-ARCHITECTURE.md "SQLite Schema" saat app pertama kali jalan. Database location: `app.getPath('userData')/kaemform.db`.

Buat folder structure saat pertama kali: `~/KaemForm/templates/`, `~/KaemForm/output/`, `~/KaemForm/rekap/`, `~/KaemForm/data/`. Gunakan `app.getPath('home')` + `/KaemForm/`.

Env file (.env):
```
VITE_SUPABASE_URL=             # Supabase Project B (sama dengan web)
VITE_SUPABASE_ANON_KEY=        # Supabase Project B (sama dengan web)
```

---

## B. Auth & Sync

### Login

Buat halaman Login.tsx:
- Logo KaemForm + "KaemForm Desktop"
- Tombol "Masuk dengan Google"
- Auth flow: buka system browser via shell.openExternal() → Supabase Google OAuth → custom protocol callback `kaemform://auth/callback` → set session
- Register custom protocol di main process: `app.setAsDefaultProtocolClient('kaemform')`
- Handle deep link: parse URL → extract session tokens → set session di Supabase client
- Simpan session refresh token di SQLite settings untuk auto-login
- Future-ready: placeholder untuk "Masuk dari Kaemnur" (launch token, belum aktif)

### Sync Engine

Buat src/main/services/sync-engine.ts sesuai docs/DESKTOP-ARCHITECTURE.md "Sync Engine":

- `syncAll()`: pull workspaces → forms → responses → simpan ke SQLite cache
- `syncIncremental()`: hanya pull yang updated_at > lastSynced
- Jalankan saat startup + setiap N menit (dari settings sync_interval)
- IPC events: 'sync:start', 'sync:status'
- Emit progress ke renderer: {isSyncing, lastSynced, error}

---

## C. Layout & Sidebar

### App Shell — App.tsx

```
┌────────┬──────────────────────────────────┐
│SIDEBAR │  CONTENT (React Router)          │
│ 220px  │                                  │
│        │                                  │
└────────┴──────────────────────────────────┘
```

### Sidebar.tsx

Sesuai docs/DESKTOP-PRD.md "Sidebar & Navigation":
- bg kaem-900, height 100vh, fixed
- Logo: icon K (putih) + "KaemForm" teks putih
- Divider: border kaem-700
- Menu items: icon (lucide-react, 18px, kaem-300) + label (white, 14px)
- Active: bg kaem-700, rounded-lg, font-medium
- Hover: bg kaem-800
- Items: Dashboard, Generate, Template, Data, Rekap, Riwayat, (divider), Settings
- "Buka Workspace" button di bawah: border kaem-600, text kaem-200, klik → shell.openExternal(web app URL)
- Footer: SyncStatus component (dot hijau + "Tersinkronkan • 2m") + version

Collapsible: tombol toggle di atas sidebar, collapse ke 56px (icon only).

---

## D. Halaman — Dashboard

Dashboard.tsx:
- Header: "Selamat datang, {nama}" (dari auth)
- Workspace aktif card: nama workspace, form count, response count, last synced
- Quick actions: 3 cards horizontal
  - "Generate Dokumen" → navigate /generate
  - "Upload Template" → trigger template upload IPC
  - "Buat Rekap" → navigate /rekap
- Recent activity: 5 riwayat terakhir dari SQLite history table (card list)
- Semua data dari SQLite cache (offline-capable, cepat)

---

## E. Halaman — Template

Templates.tsx:
- Header "Template" + tombol "Upload Template"
- Grid template cards (2 kolom):
  - Nama template, jumlah placeholder, tanggal upload
  - Actions: Preview, Hapus
  - Klik card → detail panel (daftar placeholder, preview)
- Upload flow:
  - DragDropZone component (dashed border, icon upload, "Seret file .docx ke sini")
  - Atau klik → IPC 'template:upload' → file dialog filter .docx
  - Main process: copy file ke templates/, parse placeholder dengan docxtemplater InspectModule, simpan ke SQLite
  - Return: {id, name, placeholders[], filepath}
- Empty state: "Belum ada template. Upload file .docx untuk mulai."

---

## F. Halaman — Generate (Multi-Step)

Generate.tsx — implementasikan sebagai wizard multi-step dengan state di generateStore (Zustand):

```typescript
interface GenerateState {
  step: 1 | 2 | 3 | 4 | 5
  templateId: string | null
  dataSource: 'kaemform' | 'excel' | 'manual'
  sourceId: string | null         // form_id atau filename
  records: Record<string, any>[]  // data rows
  mapping: Record<string, string> // placeholder → column name
  outputFormats: ('docx' | 'pdf')[]
  isGenerating: boolean
  progress: {current: number, total: number, currentFile: string}
}
```

### Step 1: Pilih Template

- Grid template cards (sama seperti halaman Template)
- Klik → setTemplateId → next step
- Atau "Upload Template Baru" → upload flow → otomatis select

### Step 2: Pilih Data Source

- 3 tab cards:
  **Dari KaemForm:**
  - List form dari active workspace (dari cache)
  - Klik form → tampilkan response count
  - Pilih → load responses → next
  **Dari Excel:**
  - DragDropZone → IPC 'excel:import' → parse → tampilkan preview tabel (5 baris pertama)
  - Kolom headers terdeteksi otomatis
  - Pilih → next
  **Input Manual:**
  - Tampilkan form input: satu field per placeholder dari template
  - Tombol "+ Tambah Record" untuk multiple entries
  - Tabel preview di bawah

### Step 3: Mapping

- MappingTable component:
  - Kolom kiri: Placeholder (dari template, e.g. {{nama}}, {{nip}})
  - Kolom kanan: dropdown pilih kolom dari data source
  - Auto-map: jika placeholder name ≈ column name (case insensitive, strip {{}}), otomatis set
  - Status: ✓ mapped (hijau), ✗ unmapped (merah)
  - Semua placeholder harus mapped untuk lanjut

### Step 4: Preview

- PreviewPanel:
  - Tampilkan hasil generate untuk record pertama
  - Render: IPC 'template:preview' → main process render docx dengan data → return HTML representation
  - Navigasi: ← record 1 dari 50 → (prev/next buttons)
  - Tombol "Edit Mapping" → back to step 3

### Step 5: Generate

- Pilih output format: ☑ DOCX ☑ PDF
- Pilih folder output (default dari settings, bisa browse)
- Tombol "Generate {N} Dokumen"
- Progress: ProgressBar component
  - IPC event stream 'generate:progress' → update bar
  - Show: current/total, filename sedang diproses, estimasi waktu
- Cancel button
- Selesai: success card
  - "{N} dokumen berhasil dibuat"
  - "Buka Folder" button → IPC 'generate:open-folder'
  - "Generate Lagi" → reset
  - Auto-save ke history table

### Generate Engine (Main Process)

src/main/services/docx-engine.ts:

```typescript
export async function generateDocuments(params: {
  templatePath: string,
  records: Record<string, any>[],
  mapping: Record<string, string>,
  outputFormats: string[],
  outputPath: string,
  onProgress: (progress: {current: number, total: number, filename: string}) => void
}): Promise<{success: number, failed: number, outputPath: string}> {
  // Untuk setiap record:
  // 1. Baca template dengan pizzip
  // 2. Map data sesuai mapping: {placeholder: record[mapping[placeholder]]}
  // 3. Render dengan docxtemplater
  // 4. Simpan .docx ke outputPath
  // 5. Jika PDF diminta: convert via LibreOffice CLI atau fallback
  // 6. Emit progress
}
```

Filename output: ambil dari field pertama yang di-map (biasanya nama) + sanitize. Jika duplikat, tambah angka. Contoh: `Ahmad_Fauzi.docx`, `Ahmad_Fauzi_2.docx`.

---

## G. Halaman — Data

Data.tsx:
- Tab "KaemForm" | "Lokal"
- **KaemForm tab:**
  - List form dari cache (card: nama form, response count, last synced)
  - Klik form → DataTable component: tabel responses (kolom dari form schema)
  - Pagination, search (local filter)
  - Tombol "Gunakan untuk Generate" → navigate /generate dengan form pre-selected
- **Lokal tab:**
  - List imported Excel files
  - DragDropZone untuk import baru
  - Klik file → preview tabel
  - Tombol hapus

---

## H. Halaman — Rekap

Rekap.tsx:
- Pilih data source: dropdown form (dari cache) atau file lokal
- Kustomisasi:
  - Checklist kolom yang mau dimasukkan
  - Urutan kolom (drag reorder)
  - Filter (opsional): status, tanggal range
  - Judul rekap (text input)
- Preview tabel
- Tombol "Generate Rekap Excel"
- IPC 'excel:generate-rekap' → ExcelJS generate → simpan ke rekap/
- Selesai: "Buka File" + "Buka Folder"

---

## I. Halaman — Riwayat

Riwayat.tsx:
- Tabel dari SQLite history: tanggal, template name, data source, output count, status
- Klik row → detail panel:
  - Mapping yang digunakan
  - Output path
  - Tombol "Buka Folder"
  - Tombol "Generate Ulang" → navigate /generate dengan template + mapping pre-filled

---

## J. Halaman — Settings

Settings.tsx:
- **Akun:** avatar + nama + email (dari Supabase session). Tombol Logout.
- **Workspace:** dropdown pilih workspace aktif (dari cache). Trigger re-sync saat berubah.
- **Output:** path folder default. Tombol "Ubah" → folder dialog.
- **Sinkronisasi:** interval dropdown (1/5/15 menit). Tombol "Sinkronkan Sekarang". Last synced info.
- **Tentang:** "KaemForm Desktop v1.0.0", link kaemnur.com, link form.kaemnur.com.

---

## K. Shared Components

Buat di renderer/components/ui/:
- Button, Input, Card, Badge, Modal (Dialog), Tabs, Toast, Spinner, Skeleton — styling identik web (kaem colors, rounded-xl, shadow-card)
- DragDropZone — dashed border, icon, accept filter
- DataTable — sortable, searchable, paginated (lokal, bukan server)
- ProgressBar — animated, kaem-500 fill
- EmptyState — icon + message + CTA

---

## Verifikasi

1. App launch → login screen → Google OAuth → redirect back → dashboard
2. Sync: workspaces + forms + responses terload dari cloud
3. Upload template .docx → placeholder terdeteksi → card muncul
4. Generate flow: pilih template → pilih data dari KaemForm → mapping auto → preview → generate 5 dokumen → cek output folder → .docx valid (layout preserved)
5. Rekap: generate .xlsx dari responses → buka di Excel → format rapi
6. Riwayat: generate tercatat → bisa buka folder → bisa re-generate
7. Offline: matikan internet → app tetap bisa buka, baca cache, generate dari data lokal
8. "Buka Workspace" → browser terbuka di form.kaemnur.com/app
