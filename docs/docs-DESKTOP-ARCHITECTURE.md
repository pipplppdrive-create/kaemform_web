# KaemForm Desktop — Architecture & Database

## Project Structure

Lokasi: `C:\Users\kaemn\OneDrive\Desktop\PROJECTS\KaemForm\apps\desktop`

```
apps/desktop/
├── src/
│   ├── main/                      # Electron main process
│   │   ├── index.ts               # App entry, window management
│   │   ├── ipc.ts                 # IPC handlers (main ↔ renderer)
│   │   ├── services/
│   │   │   ├── docx-engine.ts     # Word template processing (docxtemplater)
│   │   │   ├── pdf-engine.ts      # PDF generation
│   │   │   ├── excel-engine.ts    # Excel generation (ExcelJS)
│   │   │   ├── sync-engine.ts     # Supabase data sync
│   │   │   ├── db.ts              # SQLite database (better-sqlite3)
│   │   │   └── file-manager.ts    # File system operations
│   │   ├── menu.ts                # App menu
│   │   └── updater.ts             # Auto-update (future)
│   │
│   ├── renderer/                  # React frontend
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Generate.tsx       # Multi-step generate flow
│   │   │   ├── Templates.tsx
│   │   │   ├── Data.tsx
│   │   │   ├── Rekap.tsx
│   │   │   ├── Riwayat.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SyncStatus.tsx
│   │   │   ├── TemplateCard.tsx
│   │   │   ├── MappingTable.tsx
│   │   │   ├── PreviewPanel.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── DragDropZone.tsx
│   │   │   └── ui/               # Shared UI (Button, Input, Card, dll)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSync.ts
│   │   │   ├── useWorkspace.ts
│   │   │   └── useIpc.ts         # Wrapper for IPC calls
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── workspaceStore.ts
│   │   │   └── generateStore.ts  # Multi-step generate state
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   └── utils.ts
│   │   └── styles/
│   │       └── globals.css        # Tailwind
│   │
│   └── shared/                    # Shared types (bisa import dari packages/shared juga)
│       └── types.ts
│
├── resources/                     # Icons, assets
│   └── icon.png
├── electron-builder.yml           # Build config
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts                 # Vite for renderer
├── vite.main.config.ts            # Vite for main
└── package.json
```

Toolchain: electron-vite (Vite bundler untuk Electron, supports React + TypeScript + Tailwind).

## IPC Communication

Main process menjalankan semua operasi berat (file, docx, pdf, xlsx, sqlite).
Renderer hanya UI. Komunikasi via IPC:

```typescript
// IPC Channels

// Auth
'auth:login'              → trigger Google OAuth
'auth:logout'             → clear session
'auth:get-session'        → return current session

// Sync
'sync:start'              → pull data from Supabase
'sync:status'             → return {lastSynced, isSyncing}
'sync:get-workspaces'     → return workspaces[]
'sync:get-forms'          → return forms[] for active workspace
'sync:get-responses'      → return responses[] for form

// Template
'template:upload'         → open file dialog, copy to templates/, detect placeholders
'template:list'           → return templates from SQLite
'template:get'            → return template detail + placeholders
'template:delete'         → delete from SQLite + file system
'template:preview'        → return rendered preview (HTML) of template

// Generate
'generate:start'          → {templateId, data[], mapping, outputFormats}
'generate:progress'       → event stream: {current, total, filename, status}
'generate:cancel'         → abort current generation
'generate:open-folder'    → open output folder in file explorer

// Excel
'excel:import'            → open file dialog, parse xlsx/csv, return headers + preview rows
'excel:generate-rekap'    → {data, columns, title} → generate .xlsx

// Riwayat
'riwayat:list'            → return history from SQLite
'riwayat:get'             → return detail
'riwayat:open-folder'     → open output folder

// Settings
'settings:get'            → return settings from SQLite
'settings:update'         → update settings
'settings:get-output-path' → return default output folder
'settings:set-output-path' → open folder dialog, set new path
```

## SQLite Schema (Local Database)

```sql
-- Templates yang diupload user
CREATE TABLE templates (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  filename    TEXT NOT NULL,          -- nama file asli
  filepath    TEXT NOT NULL,          -- path lokal relatif
  placeholders TEXT NOT NULL,         -- JSON array ["nama","nip","jabatan"]
  metadata    TEXT DEFAULT '{}',      -- JSON
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Cache workspace dari cloud
CREATE TABLE cache_workspaces (
  id          TEXT PRIMARY KEY,
  data        TEXT NOT NULL,          -- JSON workspace object
  synced_at   TEXT DEFAULT (datetime('now'))
);

-- Cache forms dari cloud
CREATE TABLE cache_forms (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL,
  data          TEXT NOT NULL,        -- JSON form object (termasuk schema)
  synced_at     TEXT DEFAULT (datetime('now'))
);

-- Cache responses dari cloud
CREATE TABLE cache_responses (
  id          TEXT PRIMARY KEY,
  form_id     TEXT NOT NULL,
  data        TEXT NOT NULL,          -- JSON response data
  submitted_at TEXT,
  synced_at   TEXT DEFAULT (datetime('now'))
);

-- Riwayat generate
CREATE TABLE history (
  id              TEXT PRIMARY KEY,
  template_id     TEXT NOT NULL,
  data_source     TEXT NOT NULL,      -- 'kaemform:{form_id}' | 'excel:{filename}' | 'manual'
  record_count    INTEGER NOT NULL,
  output_formats  TEXT NOT NULL,      -- JSON array ["docx","pdf"]
  output_path     TEXT NOT NULL,
  mapping         TEXT NOT NULL,      -- JSON mapping object
  status          TEXT DEFAULT 'completed',
  created_at      TEXT DEFAULT (datetime('now'))
);

-- Settings
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Default settings
INSERT INTO settings VALUES ('output_path', '~/KaemForm/output');
INSERT INTO settings VALUES ('sync_interval', '5');
INSERT INTO settings VALUES ('active_workspace', '');
INSERT INTO settings VALUES ('theme', 'light');
```

## Sync Engine

```
App startup:
  1. Cek session Supabase → jika expired, login screen
  2. Pull workspaces WHERE owner_id = user
  3. Pull forms WHERE workspace_id = active_workspace
  4. Pull responses untuk setiap form (paginated, max 500/form)
  5. Simpan semua ke SQLite cache
  6. UI baca dari SQLite (cepat, offline-capable)

Periodic sync (setiap N menit):
  1. Pull perubahan (cek updated_at > last synced)
  2. Update SQLite cache
  3. Notify renderer via IPC event

Manual sync:
  1. Sama seperti startup, tapi full refresh
```

Data flow: Cloud → SQLite cache → UI. Desktop TIDAK menulis ke cloud.

## Document Generation Engine

### Word Processing (docxtemplater)

```typescript
// Template upload flow
1. User pilih .docx file
2. Baca file dengan pizzip (unzip docx)
3. Parse dengan docxtemplater InspectModule → extract semua tags
4. Tags: {{nama}}, {{nip}}, {{jabatan}}, dll
5. Simpan template metadata ke SQLite + copy file ke templates/

// Generate flow
1. Baca template file
2. Untuk setiap record di data:
   a. Clone template buffer
   b. Set data: doc.setData({nama: "Ahmad", nip: "12345", ...})
   c. Render: doc.render()
   d. Generate buffer: doc.getZip().generate({type: 'nodebuffer'})
   e. Simpan ke output folder: `{nama}_{timestamp}.docx`
3. Jika PDF juga diminta:
   a. Convert .docx → PDF via libreoffice CLI (soffice --convert-to pdf)
      atau puppeteer (render HTML version)
   b. Simpan .pdf ke output folder
```

### PDF Strategy

Opsi terbaik untuk mempertahankan layout Word:
1. **LibreOffice CLI** (recommended): `soffice --headless --convert-to pdf input.docx`
   - Pro: layout persis sama
   - Kontra: perlu LibreOffice terinstall, atau bundle soffice portable
2. **Fallback: docx-preview + puppeteer**: render docx ke HTML, print ke PDF
   - Pro: tidak perlu dependency external
   - Kontra: layout mungkin sedikit berbeda

Rekomendasi: deteksi LibreOffice di system. Jika ada, gunakan. Jika tidak, gunakan fallback + info ke user "Install LibreOffice untuk hasil PDF yang lebih akurat".

### Excel Generation (ExcelJS)

```typescript
// Rekap generation
1. Buat workbook baru
2. Sheet 1 "Data":
   - Row 1: header (bold, bg kaem-100, border)
   - Row 2+: data
   - Kolom A: nomor urut
   - Auto-width per kolom
   - Border all cells
3. Sheet 2 "Ringkasan":
   - Total data: X
   - Tanggal generate: Y
   - Sumber: form "Z" / file "W"
4. Save ke rekap/ folder
```

## Design System Desktop

Sama dengan web (docs-UI-REDESIGN.md) tapi disesuaikan:

- Sidebar: bg kaem-900, text white, icons, active state bg kaem-700
- Content area: bg gray-50
- Cards: sama (white, rounded-xl, shadow-card)
- Buttons: sama (kaem-600 primary)
- Inputs: sama
- Warna kaem: identik dengan web

Dark mode ready: sidebar sudah dark, content area bisa di-swap future.

Window:
- Min size: 1024x640
- Default: 1280x800
- Titlebar: custom (frameless + custom title bar) atau native — pilih native untuk MVP (lebih simpel)
