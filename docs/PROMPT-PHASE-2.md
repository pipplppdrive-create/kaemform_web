# Prompt Phase 2 — Form Builder, Signature, Public Form, Responses, Export

Referensi: docs/UI-SPEC.md (builder layout, field types, form publik, signature, response dashboard), docs/DATABASE.md (JSONB structures), docs/API-CONTRACT.md (response API, export API), docs/BUSINESS.md (tier limits).

Fase sebelumnya (Phase 1) sudah selesai: project setup, auth, workspace CRUD, form CRUD, semua UI components dasar sudah ada.

---

## A. Form Builder

### Zustand Store — stores/formBuilderStore.ts

State: formId, fields (FormField[]), selectedFieldId, isDirty, isSaving, history (FormField[][], max 50 steps), historyIndex.

Actions: setFields, addField(type, index?), removeField(id), updateField(id, partial), moveField(from, to), selectField(id|null), undo, redo, markSaved.

addField: buat field baru dengan nanoid id, label default "Field Baru", config default per type. moveField: update order semua fields. Setiap mutation push ke history.

### Builder Page — /app/w/[workspaceSlug]/f/[formId]/page.tsx

Fetch form dari API, init store dengan form.schema. Three-panel layout sesuai docs/UI-SPEC.md "Form Builder Layout":

**Topbar:** tombol back (← workspace), judul form (editable inline), status badge, "Pratinjau" toggle, "Publikasikan"/"Tutup" button, auto-save indicator ("Tersimpan ✓" / "Menyimpan...").

**Panel Kiri (Palette, 240px):** daftar field types sesuai docs/UI-SPEC.md "Field Types & Props", dikelompokkan (Teks, Pilihan, Input, Waktu, Lainnya). Setiap item draggable via dnd-kit. Label dari i18n.

**Panel Tengah (Canvas):** scrollable, render fields dari store. Setiap field: label, input preview (disabled), tombol hapus (✕), drag handle. Selected field: border biru. Empty state: "Drag field dari panel kiri". Tombol "+ Tambah Field" di bawah.

**Panel Kanan (Props, 280px):** tampil saat field selected. Properties sesuai docs/UI-SPEC.md "Field Types & Props" — setiap tipe punya props spesifik. Common: label, description, required toggle. Choice fields: dynamic option list (add/remove/reorder). Perubahan langsung update store.

**Responsive (< 768px):** palette → bottom sheet, props → bottom panel, canvas full width.

### Drag & Drop (dnd-kit)

DndContext + DragOverlay. Dua mode:
1. Palette → canvas: clone, tampilkan overlay, drop → addField(type, dropIndex)
2. Canvas reorder: useSortable per field, drop → moveField(from, to)

Sensors: PointerSensor, activationConstraint distance 5px.

### Field Renderers (Builder)

Di components/form-builder/fields/, buat renderer per type — tampilkan preview visual (disabled, non-interactive). Buat registry FieldBuilderRegistry: map FieldType → Component. Semua types sesuai docs/UI-SPEC.md.

Untuk choice fields (single_choice, multiple_choice, dropdown): render opsi dari field.options array.
Untuk signature: area placeholder dengan border dashed + teks "Area tanda tangan".
Untuk section: heading styled sebagai separator.
Untuk paragraph: rendered text content.

### Auto-Save

Setiap kali fields berubah: set isDirty. Debounce 2 detik → PATCH /api/forms/{formId} dengan {schema: fields} → markSaved. Handle error: toast "Gagal menyimpan".

### Preview Mode

Toggle preview: sembunyikan palette + props, canvas render form seperti form publik (gunakan FormRenderer component dari bagian B). Topbar: "Kembali ke Editor".

---

## B. Signature Canvas & Public Form

### SignatureCanvas — components/shared/SignatureCanvas.tsx

Props: value (SignatureData|null), onChange(data), width, height, disabled, penColor, penWidth.

Implementasi sesuai docs/UI-SPEC.md "Signature Canvas":
- HTML5 Canvas + PointerEvent (pointerdown/move/up + setPointerCapture)
- Capture pressure (event.pressure) jika tersedia
- Line smoothing: quadratic bezier antar titik
- Background putih + garis abu-abu tipis bawah
- Actions: Clear (hapus semua strokes), Undo (pop stroke terakhir)
- Render ulang dari data saat mount/value change (fungsi renderSignature)
- Data format: SignatureData dari packages/shared/types (strokes array + canvas dimensions)
- Validasi: min 1 stroke, min 10 titik

### SignatureRenderer — components/shared/SignatureRenderer.tsx

Read-only SVG renderer: convert strokes → SVG path elements. Props: data, width, height, className. Dipakai di response detail.

### Public Form — /(public)/[slug]/page.tsx

Server component:
1. Query form by slug (published, not deleted)
2. Not found → 404. Closed → pesan tutup. Draft/archived → 404
3. Cek limit_responses: count >= limit → pesan "penuh"
4. Cek require_login: true + not logged in → tombol login
5. Render FormRenderer component
6. Metadata: title, description, robots noindex

### FormRenderer — components/form-renderer/FormRenderer.tsx

Client component. Props: form, onSubmit.

Layout sesuai docs/UI-SPEC.md "Form Publik": centered card max-w-640px, title, description, fields berurutan, submit button, footer "Dibuat dengan KaemForm" (hide jika Pro + remove_branding).

State: formData (Record<string,any>), errors (Record<string,string>), isSubmitting, visibleFields (Record<string,boolean>).

Honeypot: hidden input name="website", display:none. Jika terisi → reject silently.

Progress bar (scroll-based) jika show_progress_bar setting = true.

### Field Renderers (Public)

Di components/form-renderer/fields/, buat input component per type — fully interactive. Props: field, value, onChange, error. Validasi on blur. Sesuai docs/UI-SPEC.md "Field Types & Props" kolom "Public Input".

### Conditional Logic Engine — lib/conditions.ts

evaluateConditions(fields, formData) → Record<string,boolean> (field_id → isVisible). Default semua visible. Evaluasi conditions array per field sesuai docs/DATABASE.md "Condition operators/actions". Re-evaluate di FormRenderer setiap formData berubah.

### Response Validation — lib/validations/response-validator.ts

validateResponse(fields, data, visibleFields) → Record<string,string> (errors). Hanya validasi visible fields. Cek: required, min/max_length, min/max_value, email format, phone format, signature (min 1 stroke + 10 titik).

### Response Submission API — POST /api/responses

Sesuai docs/API-CONTRACT.md: validasi form published, server-side validation, honeypot check, rate limit 5/mnt/IP (hash IP SHA-256), hitung expires_at (form owner's retention_days dari license_cache), insert response, increment response_count, return success. Jika form settings.notification_emails non-empty + owner Pro: kirim email notifikasi async (skip dulu, implementasi email di Phase 3).

### Success Page — /[slug]/success

Pesan sukses dari form settings (atau default i18n). Link "Kirim respons lain" jika form masih open.

---

## C. Response Dashboard & Export

### Response Dashboard — /app/w/[ws]/f/[id]/responses/page.tsx

Sesuai docs/UI-SPEC.md "Response Dashboard":

- Summary cards: Total, Hari Ini, Minggu Ini (dari GET /api/forms/[id]/stats)
- Line chart: response per hari 30 hari terakhir (recharts LineChart atau simple SVG)
- Tabel: #, Tanggal, 3-5 field pertama. Pagination 20/halaman cursor-based. Sort submitted_at desc.
- Klik row → Modal detail: semua field label→value, signature via SignatureRenderer, metadata
- Retention banner: "Data disimpan {X} hari" + warning jika < 7 hari tersisa
- Tombol export: "CSV" + "PDF" (PDF disabled jika Free)

### Stats API — GET /api/forms/[id]/stats

Return {total, today, thisWeek, perDay: [{date, count},...]}. Query: COUNT + GROUP BY date dari responses WHERE form_id, last 30 days.

### Responses API — GET /api/forms/[id]/responses

List: pagination (page, limit=20), sort submitted_at desc, search (data::text ILIKE). Return {data[], total, hasMore}. Auth: workspace owner/member.

### Export CSV — GET /api/forms/[id]/export/csv

Header: field labels. Rows: response values. Signature → "[Tanda Tangan]". Multiple choice → join koma. Rate limit 10/jam. Content-Disposition attachment.

### Export PDF — GET /api/forms/[id]/export/pdf

Install @react-pdf/renderer. Generate PDF tabel sederhana: header (judul, tanggal export), tabel semua responses, footer (halaman X/Y). Signature: render strokes → SVG → embed. Pro only (cek license). Rate limit 10/jam.

### Realtime

Subscribe Supabase Realtime: INSERT on responses WHERE form_id = current. New response → prepend tabel + update summary + subtle notification "Respons baru".

---

## Verifikasi Phase 2

1. Builder: drag field dari palette ke canvas, reorder, edit properties, auto-save
2. Undo/redo berfungsi
3. Preview mode menampilkan form seperti publik
4. Signature canvas: gambar, undo stroke, clear, data tersimpan
5. Form publik /{slug}: render, isi, submit → success page
6. Validasi inline (required, email format, dll)
7. Conditional logic: set di builder → field show/hide di publik
8. Honeypot menolak bot
9. Response dashboard: summary, chart, tabel, pagination
10. Detail response: semua field + signature rendered
11. Export CSV valid. Export PDF valid (Pro).
12. Realtime: submit di tab lain → dashboard update
