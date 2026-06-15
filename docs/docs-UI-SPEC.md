# KaemForm — UI/UX Specification

## Design System

- Primary: #2563EB, Background: #FFFFFF / #F9FAFB, Error: #DC2626, Success: #16A34A, Border: #E5E7EB
- Font: Inter (Google Fonts), body 14-16px
- Radius: 8px card, 6px input. Shadow minimal, prefer border.
- Components: Radix UI primitives + Tailwind
- Bahasa UI: Indonesia (via next-intl). Semua teks pakai translation key, tidak ada hardcode.

## Form Builder

### Layout (Desktop)

```
┌──────────────────────────────────────────────────────┐
│ [← Workspace]  Judul Form (editable)  [Pratinjau] [Publikasikan] │
│                                       Auto-saved ✓               │
├──────────┬─────────────────────────────────┬─────────┤
│ PALETTE  │         CANVAS                  │  PROPS  │
│ 240px    │                                 │  280px  │
│          │  ┌───────────────────────────┐   │         │
│ □ Teks   │  │ Nama Lengkap          ✕  │   │ Label   │
│ □ Email  │  │ [__________________]     │   │ [____]  │
│ □ Angka  │  │                          │   │ Wajib   │
│ □ Pilihan│  ├───────────────────────────┤   │ [✓]    │
│ □ Tanggal│  │ Email                ✕  │   │         │
│ □ Skala  │  │ [__________________]     │   │ Validasi│
│ □ TTD    │  └───────────────────────────┘   │ [____]  │
│ □ Section│  [+ Tambah Field]                │         │
└──────────┴─────────────────────────────────┴─────────┘
```

### Layout (Mobile < 768px)

- Palette → bottom sheet (tombol "+" membuka)
- Props → bottom panel saat field dipilih
- Canvas → full width

### Interactions

- Drag dari palette ke canvas → tambah field
- Drag antar field → reorder
- Klik field → select (highlight biru) + tampil props
- Klik label di canvas → edit inline
- Auto-save: debounce 2 detik setelah perubahan
- Undo/Redo: Ctrl+Z / Ctrl+Shift+Z (store max 50 history steps)

### Field Types & Props

| Type | Builder Preview | Public Input | Specific Props |
|---|---|---|---|
| short_text | input disabled | input text | placeholder, min/max length |
| long_text | textarea disabled | textarea auto-grow | placeholder, min/max length |
| number | input number disabled | input number | placeholder, min/max value |
| email | input disabled | input email + validasi format | placeholder |
| phone | input disabled | input tel | placeholder |
| date | date input disabled | native date picker | - |
| time | time input disabled | native time picker | - |
| datetime | datetime disabled | native datetime-local | - |
| single_choice | radio buttons | radio buttons styled | options list (min 2) |
| multiple_choice | checkboxes | checkboxes styled | options list (min 2) |
| dropdown | select disabled | select dropdown | options list (min 2) |
| scale | angka 1-5 | clickable number buttons | min, max, label awal/akhir |
| signature | placeholder "Area TTD" | SignatureCanvas | - |
| section | heading + desc | heading + desc (non-input) | title, description |
| paragraph | rendered text | rendered text (non-input) | content |

Common props semua field: label, description, required.

### Conditional Logic UI

Di props panel, section "Kondisi":
- Toggle "Tampilkan dengan kondisi"
- Jika on: dropdown field referensi (hanya field di atas) → operator → value → action (tampilkan/sembunyikan)
- Satu kondisi per field (MVP)

## Form Publik

- Centered card, max-width 640px, padding 24-32px
- Mobile-first, responsive
- Validasi inline on blur
- Submit button disabled setelah klik (prevent double)
- Honeypot: hidden input `name="website"`, jika terisi → reject silently
- Footer: "Dibuat dengan KaemForm" (hide jika Pro + remove_branding)
- Progress bar (scroll-based) jika show_progress_bar = true
- Success page: customizable message + "Kirim respons lain" link

## Signature Canvas

- HTML5 Canvas + PointerEvent (touch + mouse + stylus)
- Pressure sensitivity (event.pressure) jika tersedia
- Line smoothing: Catmull-Rom atau quadratic bezier
- Min size: 300x150px, responsive to container
- Background: putih + garis abu-abu tipis bawah
- Actions: Clear (hapus semua), Undo (hapus stroke terakhir)
- Warna: hitam default, biru opsional
- Validasi: min 1 stroke, min 10 titik total
- Disclaimer: "Tanda tangan ini bersifat konfirmasi, bukan tanda tangan elektronik tersertifikasi."
- Data: JSON strokes array (2-8 KB rata-rata)

## Response Dashboard

- Summary cards: Total, Hari Ini, Minggu Ini
- Line chart: response per hari (30 hari terakhir)
- Tabel: # | Tanggal | 3-5 field pertama sebagai preview kolom
- Pagination cursor-based, 20/halaman
- Klik row → detail modal (semua field + TTD rendered + metadata)
- Export: tombol CSV + PDF (Pro)
- Realtime: Supabase subscribe INSERT → prepend + notification
- Retention banner: "{X} hari tersisa" / warning jika < 7 hari

## Key Pages

| Page | Content |
|---|---|
| /login | "Masuk ke KaemForm" + Google OAuth + link Kaemnur |
| /app (no workspace) | Onboarding: "Buat workspace pertama" |
| /app (has workspace) | Workspace cards + quick action |
| Workspace dashboard | Form grid/list + create + filter/sort |
| Builder | Three-panel + auto-save + preview toggle |
| Responses | Summary + chart + table + export |
| Form settings | Umum, pengaturan, retensi, tampilan, notifikasi, bahaya |
| App settings | Profil (read), lisensi, bahasa |
| Landing (/) | Redirect /app jika login, simple hero jika tidak |

## Shared UI Components

Button (primary/secondary/ghost/danger), Input, Card, Badge (draft/published/closed), Modal (Radix Dialog), DropdownMenu, Toast, EmptyState (ilustrasi + pesan + CTA), Skeleton loader, Spinner.
