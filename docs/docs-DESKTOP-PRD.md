# KaemForm Desktop — PRD

## Ringkasan

**Nama:** KaemForm Desktop
**Posisi:** Workspace administrasi yang tersinkron dengan KaemForm Web
**Fungsi utama:** Generate dokumen biodata dari template Word, mail merge, dan rekap Excel otomatis
**Lokasi project:** `C:\Users\kaemn\OneDrive\Desktop\PROJECTS\KaemForm\apps\desktop`

## Masalah yang Diselesaikan

- User mengumpulkan data via KaemForm Web, tapi harus manual copy-paste ke Word satu per satu
- Mail merge di MS Word ribet dan error-prone
- Membuat rekap Excel dari data formulir memakan waktu
- Tidak ada workflow terintegrasi: collect data → generate dokumen → rekap

## Target Pengguna

| Segmen | Workflow |
|---|---|
| Admin instansi | Kumpulkan data pegawai → generate biodata per orang → rekap Excel |
| Panitia event | Registrasi → generate sertifikat/ID card → rekap peserta |
| HRD | Data karyawan → generate surat/formulir → rekap |
| Guru/dosen | Data siswa → generate rapor/surat → rekap nilai |

## Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | Electron | Butuh Node.js ecosystem untuk docx/xlsx/pdf processing |
| Frontend | React + Tailwind | Share design system dengan web |
| State | Zustand | Konsisten dengan web |
| Word Processing | docxtemplater + pizzip | Deteksi placeholder, generate docx, pertahankan layout |
| PDF Generation | Puppeteer / html-pdf-node | Convert docx → PDF |
| Excel | ExcelJS | Generate xlsx yang rapi |
| Database lokal | better-sqlite3 | Cache, riwayat, arsip |
| Sync | Supabase JS SDK | Koneksi ke KaemForm Supabase Project B |

**Mengapa Electron bukan Tauri:** Fitur utama desktop adalah document processing (docx, xlsx, pdf). Semua library matur untuk ini ada di Node.js ecosystem. Tauri memerlukan Rust bindings atau sidecar Node yang menambah kompleksitas tanpa benefit. Untuk desktop admin tool yang jarang di-download ulang, ukuran Electron (100-150MB) bisa diterima.

## Koneksi

```
KaemForm Desktop
      │
      ├── Supabase Project B (KaemForm)
      │     ├── Auth (login)
      │     ├── Read: workspaces, forms, responses
      │     ├── Read: form_templates
      │     └── Write: TIDAK ADA (desktop read-only terhadap cloud)
      │
      └── Local Storage
            ├── SQLite: cache data, riwayat generate, template lokal
            ├── File system: template .docx, output .docx/.pdf/.xlsx
            └── Config: settings, workspace preference
```

Saat ini: koneksi langsung ke KaemForm web (Supabase B).
Future: integrasi SSO dengan Kaemnur (sudah disiapkan auth module yang bisa di-swap).

## Fitur

### 1. Login & Sync

- Login dengan Google (Supabase Auth Project B, sama dengan web)
- Future-ready: slot untuk launch token dari Kaemnur
- Setelah login: pull workspaces + forms + responses dari cloud
- Sync otomatis setiap 5 menit + manual refresh
- Pilih workspace aktif
- Status sync di footer: "Tersinkronkan • 2 menit lalu"

### 2. Template Word

- Upload file `.docx` via drag & drop atau file picker
- Sistem mendeteksi semua placeholder: `{{nama}}`, `{{nip}}`, `{{jabatan}}`, dll
- Tampilkan daftar placeholder yang ditemukan
- Simpan sebagai template reusable (di lokal + bisa sync ke cloud future)
- Preview template: tampilkan dokumen dengan placeholder di-highlight
- CRUD template: rename, edit placeholder, hapus
- Template tersimpan di folder lokal: `~/KaemForm/templates/`

### 3. Generate Biodata Individu

- Pilih template → mapping data source:
  - **Dari KaemForm:** pilih form → response data otomatis di-map ke placeholder
  - **Dari Excel:** import file .xlsx/.csv → mapping kolom ke placeholder
  - **Manual:** input per field langsung di UI
- Preview hasil sebelum generate (render Word → tampilkan preview)
- Generate per individu atau batch (semua data sekaligus)
- Output: .docx dan/atau .pdf (user pilih)
- Pertahankan layout Word asli (font, spacing, tabel, header/footer)
- File output tersimpan di folder: `~/KaemForm/output/{template_name}/{timestamp}/`
- Progress bar untuk batch generate

### 4. Mail Merge

- Pilih template + pilih data source (KaemForm responses / Excel / manual)
- UI mapping: kolom data ↔ placeholder template (drag atau dropdown)
- Auto-detect mapping jika nama kolom ≈ nama placeholder
- Preview: lihat hasil untuk data baris pertama
- Navigasi preview: ← → antar record
- Batch generate: semua record sekaligus
- Output: individual files (.docx/.pdf) atau merged single file

### 5. Rekap Excel

- Pilih form atau data source
- Generate file .xlsx yang rapi:
  - Header: kolom dari form fields
  - Data: semua responses
  - Styling: border, header bold, auto-width kolom
  - Nomor urut otomatis
  - Metadata: tanggal generate, nama form, jumlah data
  - Sheet tambahan: ringkasan (total, per status, dll)
- Template rekap bisa dikustomisasi (pilih kolom, urutan, filter)
- Output: `~/KaemForm/rekap/`

### 6. Riwayat

- Log semua generate yang pernah dilakukan
- Info: template, data source, jumlah output, tanggal, status
- Buka kembali output folder
- Re-generate dari riwayat (dengan data yang sama atau baru)

---

## Sidebar & Navigation

```
┌──────────┬───────────────────────────────────────────────┐
│          │                                               │
│  [K]     │  CONTENT AREA                                │
│ KaemForm │                                               │
│          │                                               │
│ ──────── │                                               │
│          │                                               │
│ 📊 Dashboard  │                                         │
│ 📄 Generate   │                                         │
│ 📋 Template   │                                         │
│ 📁 Data       │                                         │
│ 📈 Rekap      │                                         │
│ 🕐 Riwayat    │                                         │
│          │                                               │
│ ──────── │                                               │
│          │                                               │
│ ⚙ Settings    │                                         │
│          │                                               │
│ ──────── │                                               │
│ 🔗 Buka       │                                         │
│   Workspace   │                                         │
│   (web)       │                                         │
│          │                                               │
│          │                                               │
│ ── footer ──  │                                         │
│ Sync ✓ 2m    │                                         │
│ v1.0.0       │                                         │
└──────────┴───────────────────────────────────────────────┘
```

Sidebar:
- Width: 220px, bg kaem-900 (dark), text white
- Logo: "K" icon + "KaemForm" text
- Menu items: icon + label, active item bg kaem-700, hover bg kaem-800
- "Buka Workspace" button: membuka form.kaemnur.com/app di browser
- Footer: sync status + version
- Collapsible: < 1024px → icon only (56px)

---

## Halaman

### Dashboard

- Workspace aktif: nama + jumlah form + responses
- Recent activity: 5 generate terakhir
- Quick actions: "Generate Baru", "Import Template", "Buka Rekap"
- Sync status card

### Generate

Flow: Pilih Template → Pilih Data → Mapping → Preview → Generate

Step 1 - Pilih Template:
- Grid template cards (yang sudah diupload)
- Tombol "Upload Template Baru"

Step 2 - Pilih Data:
- Tab: "Dari KaemForm" | "Dari Excel" | "Input Manual"
- KaemForm: pilih form → list responses
- Excel: drag & drop file → preview tabel
- Manual: form input per placeholder

Step 3 - Mapping:
- Tabel 2 kolom: Placeholder (kiri) ↔ Data Source (kanan, dropdown)
- Auto-map jika nama mirip
- Preview mapping result untuk record pertama

Step 4 - Preview:
- Render dokumen hasil (mini preview)
- Navigasi antar record: ← 1/50 →
- Tombol edit mapping

Step 5 - Generate:
- Pilih format output: ☑ DOCX ☑ PDF
- Pilih folder output (default ~/KaemForm/output/)
- Progress bar
- Selesai: "50 dokumen berhasil dibuat" + buka folder

### Template

- List template yang sudah diupload
- Card: nama, jumlah placeholder, tanggal upload
- Actions: preview, edit info, hapus
- Upload baru: drag & drop zone

### Data

- Tab: "KaemForm" (synced responses) | "Lokal" (imported Excel)
- KaemForm tab: list form → klik form → tabel responses
- Lokal tab: list imported files → preview tabel
- Import Excel baru: drag & drop

### Rekap

- Pilih data source (form / Excel / riwayat generate)
- Pilih kolom, filter, urutan
- Preview tabel
- Generate .xlsx
- Download / buka folder

### Riwayat

- Tabel: tanggal, template, data source, output count, status
- Klik: detail + buka folder output + re-generate

### Settings

- Akun: profil (from Supabase), logout
- Workspace: pilih workspace aktif
- Output: default folder path
- Sync: interval (1/5/15 menit), manual sync button
- Tampilan: dark mode toggle (future)
- Tentang: versi, link website, check update

---

## Batasan MVP

- Tidak ada edit dokumen (hanya generate dari template)
- Tidak ada collaborative editing
- Template hanya .docx (bukan .odt, .rtf)
- PDF generation: basic (dari Word, bukan custom layout)
- Satu workspace aktif pada satu waktu
- Belum ada auto-update (manual download versi baru)

## File Structure Output

```
~/KaemForm/
├── templates/           # uploaded .docx templates
├── output/              # generated documents
│   └── {template_name}/
│       └── {timestamp}/
│           ├── Ahmad_Fauzi.docx
│           ├── Ahmad_Fauzi.pdf
│           ├── Budi_Santoso.docx
│           └── ...
├── rekap/               # generated Excel recaps
├── data/                # imported Excel files
└── kaemform.db          # SQLite database
```
