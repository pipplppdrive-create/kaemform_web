# Prompt Phase 3 — Settings, Templates, Retention, Email, Tier Enforcement, Polish

Referensi: docs/BUSINESS.md (tiers, limits, enforcement, retention, templates), docs/API-CONTRACT.md (template API, cron), docs/UI-SPEC.md (settings page, components).

Phase 1 dan 2 sudah selesai: project setup, auth, workspace, form CRUD, builder, public form, response dashboard, export CSV/PDF.

---

## A. Form Settings & Conditional Logic UI

### Settings Page — /app/w/[ws]/f/[id]/settings/page.tsx

Sections:

**Umum:** judul (input), deskripsi (textarea), slug (display + copy URL button, editable jika belum pernah published + Pro untuk custom slug).

**Pengaturan:** pesan sukses (textarea), redirect URL (input, opsional), batas respons (number, null=unlimited), satu per IP (toggle), wajib login (toggle, Pro only), progress bar (toggle).

**Retensi:** tampilkan "{X} hari" dari license. Link "Perpanjang" → Kaemnur store.

**Tampilan (Pro):** warna primary (color picker), hapus branding (toggle).

**Notifikasi (Pro):** email notifikasi respons baru (input, comma-separated).

**Bahaya:** tutup formulir (confirm dialog), hapus formulir (confirm + ketik judul).

Semua simpan via PATCH /api/forms/[id]. Pro features: tampil tapi disabled untuk Free, badge "Pro", klik → modal upgrade.

### Conditional Logic UI di Builder

Di props panel, tambahkan section "Kondisi" saat field selected:
- Toggle "Tampilkan dengan kondisi"
- Jika on: dropdown pilih field referensi (hanya field yang order-nya lebih kecil) → dropdown operator (sama dengan, tidak sama, mengandung, kosong, tidak kosong) → input/dropdown nilai → dropdown aksi (tampilkan/sembunyikan)
- Simpan ke field.conditions array di store → auto-save
- Disabled untuk Free (badge "Pro", modal upgrade)

### Template Management

Sesuai docs/API-CONTRACT.md "Templates":
- Di form dropdown menu: "Simpan sebagai Template" → modal input nama+deskripsi → POST /api/templates (copy schema+settings, is_system=false, created_by=user)
- Di template selection: tab "Bawaan" | "Template Saya" → delete personal templates
- Template bawaan free tier: hanya template 1,4,7,8 (sesuai docs/BUSINESS.md)

### Form Duplication

Di workspace form dropdown: "Duplikat" → POST /api/forms/[id]/duplicate → redirect ke form baru.

---

## B. Retention Engine & Email (Resend)

### Setup Resend

Install: `npm install resend`
Buat lib/email/resend.ts: `new Resend(process.env.RESEND_API_KEY)`

### Email Templates (React components)

Buat di lib/email/templates/:

**RetentionReminder.tsx:**
Subject: "[KaemForm] Data form \"{formTitle}\" akan dihapus dalam {days} hari"
Body: greeting, info ({responseCount} respons akan dihapus {expiryDate}), actions (download CSV, backup desktop, beli storage addon), CTA buttons (Buka Dashboard, Beli Storage Add-on), footer.

**RetentionFinalReminder.tsx:**
Sama tapi urgent: "akan dihapus BESOK".

**ResponseNotification.tsx:**
Subject: "[KaemForm] Respons baru pada \"{formTitle}\""
Body: info + CTA "Lihat Respons".

### Retention Cron

Buat API route POST /api/cron/retention (proteksi: header x-cron-secret = env CRON_SECRET):

1. Query responses yang expires_at antara now() dan now()+7 hari, yang belum dikirimi reminder dalam 6 hari terakhir (cek retention_logs). Group by form_id → kirim RetentionReminder ke workspace owner.
2. Query responses expires_at antara now() dan now()+1 hari, belum dikirimi final reminder → kirim RetentionFinalReminder.
3. Soft delete: UPDATE responses SET deleted_at=now() WHERE expires_at <= now() AND deleted_at IS NULL. Log ke retention_logs action='deleted'.
4. Hard delete: DELETE FROM responses WHERE deleted_at <= now() - interval '30 days'.
5. Semua kiriman email → log ke retention_logs action='reminder_sent'.

Alternatif trigger: Supabase Edge Function (supabase/functions/retention-cleanup/) yang bisa di-schedule, ATAU external cron service (cron-job.org) memanggil /api/cron/retention setiap hari pukul 02:00 UTC.

### Response Notification

Update POST /api/responses (dari Phase 2): setelah insert berhasil, jika form settings.notification_emails non-empty DAN form owner isPro → kirim ResponseNotification ke setiap email async (Promise, jangan block response).

### Retention Info UI

Di response dashboard: banner "Data disimpan {X} hari" + jika ada response expires < 7 hari → warning banner kuning + link "Perpanjang" atau "Download sekarang".

---

## C. Tier Enforcement (Seluruh Aplikasi)

Implementasikan semua enforcement points sesuai docs/BUSINESS.md "Limit Enforcement Points":

1. **Buat workspace** → cek COUNT vs max_workspaces → tolak + modal upgrade
2. **Buat form** → cek COUNT vs max_forms_per_workspace → tolak + modal upgrade
3. **Submit response** → cek response_count vs max_responses_per_form → jika limit tercapai: auto-close form (set status='closed') + return error
4. **Signature field di palette** → disabled jika Free, tooltip "Pro"
5. **Conditional logic di props** → disabled jika Free
6. **Export PDF button** → disabled jika Free
7. **Custom slug input** → disabled jika bukan Pro
8. **Remove branding toggle** → disabled jika bukan Pro
9. **Email notification input** → disabled jika Free
10. **Template "semua"** → Free hanya lihat template 1,4,7,8

Setiap disabled item: grayed out + badge kecil "Pro" + klik → UpgradeModal: "Fitur ini memerlukan lisensi Pro" + "Upgrade: Rp 99.000/tahun" + link ke {KAEMNUR_URL}/store (atau halaman produk KaemForm di Kaemnur).

### Trial Handling

Trial = Pro features untuk 14 hari. Setelah expired → downgrade ke Free. Di dashboard header: banner "Trial — sisa {X} hari" (kuning). Setelah expired: "Trial berakhir. Upgrade ke Pro." + link.

---

## D. Polish & Finishing

### QR Code

Install: `npm install qrcode` (atau `qrcode.react` untuk React component).

Di form settings + builder topbar (saat published): tombol "QR Code" → modal tampilkan QR dari URL form → download sebagai PNG 300x300.

### App Settings — /app/settings

Profil: nama, email, avatar (read-only, dari Kaemnur). Lisensi: status + expires + storage addon info + tombol "Refresh Lisensi" (call syncLicense) + link upgrade/perpanjang. Bahasa: dropdown (Indonesia saja yang aktif untuk MVP).

### Landing Page — / (root)

Jika authenticated → redirect /app. Jika tidak → simple hero: "KaemForm — Buat formulir online dengan mudah" + CTA "Masuk" (/login) + link kaemnur.com.

### Responsive Polish

- Builder < 768px: palette bottom sheet, props bottom panel, canvas full width
- Response dashboard: tabel → cards on mobile
- Dashboard: grid 1/2/3 kolom responsive
- Form publik: sudah mobile-first (max-w-640px)

### Loading & Empty States

- Semua halaman: skeleton loader saat fetch
- Semua button: loading spinner + disabled saat action
- Empty states sesuai docs/UI-SPEC.md: workspace tanpa form, form tanpa response, search tanpa hasil

### Error Handling

- Toast untuk semua CRUD success/error
- Form validation: scroll ke field error pertama
- Network error: retry button
- Rate limit hit: "Terlalu banyak permintaan, coba lagi nanti"

### Accessibility

- Focus ring visible pada semua interactive elements
- Label associations pada form fields
- aria-label pada icon-only buttons
- Color contrast WCAG AA
- Tab order logis di builder

### Final Build Check

- Semua teks via i18n (grep: tidak ada hardcoded Indonesian string di .tsx files)
- TypeScript strict: no errors
- `npm run build` sukses
- Console clean (no warnings during normal browsing)
- Semua API routes: auth validated, errors handled
- RLS test: user A tidak bisa akses workspace/form/response user B

---

## Verifikasi Final End-to-End

1. User baru → login Google → onboarding → buat workspace → buat form dari template
2. Builder: tambah 5+ field (termasuk signature + conditional logic) → auto-save
3. Conditional logic: set "tampilkan field X jika field Y = Z" → preview → berfungsi
4. Publish → copy URL → buka incognito → isi form + tanda tangan → submit → success
5. Dashboard → response muncul real-time → signature dirender → detail lengkap
6. Export CSV → file valid. Export PDF (Pro) → file valid
7. QR code → scan → form terbuka
8. Settings → ubah pesan sukses → submit lagi → pesan baru tampil
9. Tier: Free user → signature disabled, PDF disabled, conditional logic disabled → klik → modal upgrade
10. Duplikat form → form baru terbuat
11. Simpan sebagai template → muncul di "Template Saya"
12. Retention banner tampil di response dashboard
13. Logout → login kembali → semua data utuh
14. Mobile: builder, form publik, dashboard semua usable
