# KaemForm — UI Redesign Reference

> Referensi ini menggantikan docs/UI-SPEC.md bagian visual.
> Berdasarkan analisis UI saat ini dan identitas logo KaemForm.

## Masalah UI Saat Ini

1. **Terlalu flat** — tidak ada depth, card polos tanpa visual interest
2. **Navbar terlalu simple** — hanya teks rata kiri-kanan, tidak ada karakter
3. **Spacing inconsistent** — jarak antar field di builder terlalu longgar, card dashboard terlalu kecil
4. **Tidak ada koneksi dengan brand** — warna biru hanya ada di tombol, tidak terasa di seluruh interface
5. **Properties panel kosong terasa aneh** — "Pilih field untuk mengatur properti" terlalu polos
6. **Form cards di workspace** — tidak ada visual cue untuk status, terlalu teks-heavy

---

## Color System (dari Logo KaemForm)

Logo menggunakan gradient biru dari sky blue ke royal blue. Terjemahkan ke UI:

```
Brand Colors:
  --kaem-50:   #EBF5FF    ← background tinted, hover states
  --kaem-100:  #D6EBFF    ← selected states, active sidebar
  --kaem-200:  #ADD6FF    ← borders on active elements
  --kaem-400:  #4DA3FF    ← secondary buttons, links
  --kaem-500:  #2E86DE    ← primary interactions (logo mid-blue)
  --kaem-600:  #1A6FCC    ← primary buttons, active states
  --kaem-700:  #1456A8    ← button hover
  --kaem-800:  #0D3F7F    ← dark accents
  --kaem-900:  #0A2D5C    ← navbar, sidebar background option

Neutrals:
  --gray-50:   #F8FAFC    ← page background
  --gray-100:  #F1F5F9    ← card background, input bg
  --gray-200:  #E2E8F0    ← borders
  --gray-300:  #CBD5E1    ← disabled states
  --gray-400:  #94A3B8    ← placeholder text
  --gray-500:  #64748B    ← secondary text
  --gray-700:  #334155    ← body text
  --gray-900:  #0F172A    ← headings

Semantic:
  --success:   #10B981
  --warning:   #F59E0B
  --error:     #EF4444
  --info:      --kaem-500
```

Tailwind config: extend colors dengan `kaem` namespace. Gunakan `kaem-500` sebagai primary, bukan generic `blue-600`.

---

## Typography & Spacing

```
Font: Inter (sudah dipakai — pertahankan)

Scale:
  xs:   12px / tracking-wide (labels kecil, badge)
  sm:   13px (secondary text, meta)
  base: 14px (body, form labels)
  lg:   16px (card titles, subheadings)
  xl:   20px (page titles)
  2xl:  24px (section headings)
  3xl:  30px (dashboard numbers, hero)

Weight: 400 (body), 500 (labels, nav items), 600 (headings, buttons), 700 (dashboard numbers)

Spacing system (rem-based, consistent):
  Component gap:  12px (within card)
  Card padding:   20px (desktop), 16px (mobile)
  Section gap:    32px (between sections)
  Page padding:   32px (desktop), 16px (mobile)
  Field gap:      16px (between form fields di builder dan publik)
```

---

## Navbar Redesign

Saat ini: flat white bar, teks "KaemForm" kiri, badge "Pro" + email kanan. Terlalu simple.

### Navbar Baru

```
┌─────────────────────────────────────────────────────────────────┐
│ ▌ gradient bar 3px (kaem-400 → kaem-600)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [K logo]  KaemForm          [🔔] [Pro ▾]  [avatar ▾ Nama]     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

Spesifikasi:
- Tinggi: 56px
- Background: white, border-bottom gray-200
- Top accent: gradient bar 3px tinggi, dari kaem-400 ke kaem-600 (identitas brand — visible di setiap halaman)
- Logo "K" kecil (20x20) + teks "KaemForm" warna kaem-700, font-semibold
- Kanan: notification bell (future), badge tier (kaem-500 bg, white text, rounded-full, font-xs), avatar circle 32px + nama (dropdown: Settings, Logout)
- Shadow: shadow-sm (subtle, bukan shadow-none atau shadow-lg)

---

## Dashboard Redesign

Saat ini: "Workspace Anda" heading + single flat card. Terlalu kosong.

### Dashboard Baru

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Selamat datang, Kaemnur 👋                                  │
│                                                               │
│  ┌─ Quick Stats ───────────────────────────────────────────┐ │
│  │  📋 2 Formulir    📨 15 Respons    📁 1 Workspace       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Workspace Anda                       [+ Buat Workspace Baru] │
│                                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ ▌kaem-500 left bar  │  │ ▌kaem-400 left bar  │           │
│  │                     │  │                     │           │
│  │  Puslapdik          │  │  Organisasi XYZ     │           │
│  │                     │  │                     │           │
│  │  📋 5 formulir      │  │  📋 2 formulir      │           │
│  │  📨 128 respons     │  │  📨 34 respons      │           │
│  │  Dibuat 15 Jun 2026 │  │  Dibuat 10 Jun 2026 │           │
│  │                     │  │                     │           │
│  │  [Buka →]           │  │  [Buka →]           │           │
│  └─────────────────────┘  └─────────────────────┘           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

Detail:
- Greeting: "Selamat datang, {nama}" — personal touch, font-xl
- Quick stats bar: row horizontal, 3 stat items, bg kaem-50, border kaem-100, rounded-xl, padding 16px. Angka font-2xl font-bold kaem-700, label font-sm gray-500
- Workspace cards:
  - Left accent bar 4px rounded, warna kaem-500 (bisa rotate warna per card: kaem-500, kaem-400, kaem-600)
  - Background: white, border gray-200, rounded-xl, shadow-sm
  - Hover: shadow-md + translate-y -1px (lift effect)
  - Padding: 20px
  - Title: font-lg font-semibold gray-900
  - Stats: icon kecil + text, font-sm gray-500
  - Footer: tanggal + link "Buka →" kaem-500
  - Grid: 1 col mobile, 2 col tablet, 3 col desktop

---

## Workspace Dashboard Redesign

Saat ini: daftar form cards flat.

### Workspace Dashboard Baru

```
┌──────────────────────────────────────────────────────────────┐
│  ← Workspace    Puslapdik                        [⚙ Settings] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─ Stats Row ─────────────────────────────────────────────┐ │
│  │  Total: 5     Published: 3     Draft: 2     Respons: 128│ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Formulir                    [Filter ▾] [Sort ▾] [+ Buat]    │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Daftar Hadir Rapat                                      ││
│  │  ● Published    📨 45 respons    📅 15 Jun 2026          ││
│  │  form.kaemnur.com/k7x2m9pq                    [⋮ menu]  ││
│  ├──────────────────────────────────────────────────────────┤│
│  │  Survei Kepuasan Layanan                                 ││
│  │  ○ Draf         📨 0 respons     📅 14 Jun 2026          ││
│  │                                                [⋮ menu]  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

Detail:
- Form list: list view (bukan grid) — lebih scannable untuk banyak form
- Status indicator: dot warna (hijau published, abu-abu draft, merah closed) + teks
- URL publik ditampilkan di bawah judul (font-xs, kaem-400, klik untuk copy)
- Row hover: bg kaem-50
- Divider: border-b gray-100
- "Buat" button: filled kaem-600, white text, rounded-lg, icon +

---

## Form Builder Redesign

Masalah saat ini: field cards terlalu polos, palette item tidak ada visual cue, properties panel kosong terasa bug.

### Builder Baru

```
┌──────────────────────────────────────────────────────────────────┐
│ ▌gradient 3px                                                     │
├──────────────────────────────────────────────────────────────────┤
│  ← Puslapdik   Daftar Hadir (click to edit)   Draf               │
│                                    Tersimpan ✓  [Pratinjau] [Publikasikan] │
├──────────┬────────────────────────────────────────┬──────────────┤
│          │                                        │              │
│  FIELD   │          CANVAS                        │  PROPERTI    │
│  240px   │          bg gray-50                    │  300px       │
│  bg white│                                        │  bg white    │
│          │  ┌──────────────────────────────┐      │              │
│ ┌──────┐ │  │  ┌──border-l-2 kaem-500────┐ │      │  Teks Singkat│
│ │T Teks│ │  │  │                          │ │      │              │
│ │Singkt│ │  │  │  Nama *                  │ │      │  Label       │
│ └──────┘ │  │  │  ┌─────────────────────┐ │ │      │  [Nama    ]  │
│ ┌──────┐ │  │  │  │ Nama lengkap        │ │ │      │              │
│ │≡ Teks│ │  │  │  └─────────────────────┘ │ │      │  Placeholder │
│ │Panjng│ │  │  │                    ⋮  🗑│ │      │  [Nama lkp]  │
│ └──────┘ │  │  └──────────────────────────┘ │      │              │
│ ┌──────┐ │  │                                │      │  ☑ Wajib diisi│
│ │¶ Para│ │  │  ┌──────────────────────────┐ │      │              │
│ │ graf │ │  │  │  Jabatan *               │ │      │  Validasi    │
│ └──────┘ │  │  │  ┌─────────────────────┐ │ │      │  Min: [  ]   │
│          │  │  │  │ Jabatan / posisi    │ │ │      │  Max: [100]  │
│ ─────── │  │  │  └─────────────────────┘ │ │      │              │
│ PILIHAN  │  │  └──────────────────────────┘ │      │  ── Kondisi ─│
│ ┌──────┐ │  │                                │      │  [ ] Tampilkan│
│ │◎ Plh │ │  │  [+ Tambah Field]              │      │    dengan    │
│ │Tungl │ │  │                                │      │    kondisi   │
│ └──────┘ │  └────────────────────────────────┘      │              │
│  ...     │                                          │              │
└──────────┴──────────────────────────────────────────┴──────────────┘
```

Detail kunci:

**Palette (kiri):**
- Background: white, border-r gray-200
- Items: rounded-lg, padding 8px 12px, flex row, icon + label
- Icon: 18x18, kaem-400
- Hover: bg kaem-50
- Grup label: font-xs uppercase tracking-wider gray-400, margin-top 16px
- Jarak antar item: 4px

**Canvas (tengah):**
- Background: gray-50 (bukan white — memberi kontras dengan field cards)
- Padding: 32px horizontal, 24px vertical
- Max-width: 720px centered (form tidak perlu selebar layar)
- Field card:
  - Background: white
  - Border-radius: 12px
  - Shadow: shadow-sm
  - Border-left: 3px solid transparent → kaem-500 saat selected
  - Padding: 16px 20px
  - Gap antar field: 12px
  - Hover: shadow-md (subtle lift)
  - Selected: border-left kaem-500, bg kaem-50/30
  - Drag handle (⋮⋮) di kanan atas, abu-abu, visible on hover
  - Delete (🗑) di kanan atas, merah, visible on hover
- Input preview di dalam card: input dengan bg gray-100, border gray-200, rounded-lg — tampil realistis

**Properties (kanan):**
- Background: white, border-l gray-200
- Header: type icon + nama type (font-sm kaem-500 uppercase)
- Sections: divider gray-100 antar grup
- Empty state: ilustrasi sederhana (ikon click/pointer) + "Pilih field untuk mengatur properti" — font-sm gray-400, centered
- Input fields: bg gray-50, border gray-200, focus:ring kaem-200, focus:border kaem-500

---

## Form Publik Redesign

Saat ini belum terlihat di screenshot, tapi prinsip:

```
┌──────────────────────────────────────────────┐
│               bg gray-50 full page            │
│                                               │
│   ┌───────────────────────────────────┐      │
│   │  [K] logo kecil                   │      │
│   │                                   │      │
│   │  Daftar Hadir Rapat              │      │
│   │  Isi data berikut dengan benar.  │      │
│   │                                   │      │
│   │  ─────────────────────────────── │      │
│   │                                   │      │
│   │  Nama *                           │      │
│   │  ┌─────────────────────────────┐ │      │
│   │  │                             │ │      │
│   │  └─────────────────────────────┘ │      │
│   │                                   │      │
│   │  Jabatan *                        │      │
│   │  ┌─────────────────────────────┐ │      │
│   │  │                             │ │      │
│   │  └─────────────────────────────┘ │      │
│   │                                   │      │
│   │       ┌─────────────────┐        │      │
│   │       │     Kirim       │        │      │
│   │       └─────────────────┘        │      │
│   │                                   │      │
│   │  Dibuat dengan KaemForm ♡        │      │
│   └───────────────────────────────────┘      │
│                                               │
└──────────────────────────────────────────────┘
```

Detail:
- Page bg: gray-50
- Card: white, max-w-xl (576px), mx-auto, rounded-2xl, shadow-lg, padding 32px (desktop) 20px (mobile)
- Logo mini di atas judul (opsional, bisa di-hide Pro)
- Title: font-2xl font-bold gray-900
- Description: font-base gray-500
- Divider: gradient line tipis kaem-200 → transparent (brand accent subtle)
- Input: bg gray-50, border gray-200, rounded-xl, height 44px, focus:ring-2 kaem-200
- Labels: font-sm font-medium gray-700, margin-bottom 6px
- Required: bintang merah kecil (*)
- Submit button: bg kaem-600, hover kaem-700, white text, rounded-xl, height 48px, full width, font-medium, shadow-sm
- Footer: font-xs gray-400 centered, "Dibuat dengan KaemForm"
- Success state: ikon check circle hijau + pesan + animasi subtle (fade in)

---

## Response Dashboard Redesign

```
┌──────────────────────────────────────────────────────────────┐
│  ← Daftar Hadir    Respons                    [CSV] [PDF]    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ 128      │  │ 12       │  │ 45       │                   │
│  │ Total    │  │ Hari Ini │  │ Minggu   │                   │
│  │ ▌kaem-500│  │ ▌success │  │ ▌kaem-400│                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                               │
│  ┌── Chart area ──────────────────────────────────────────┐  │
│  │   ╱‾‾╲    ╱╲                                           │  │
│  │  ╱    ╲  ╱  ╲╱╲    gradient fill kaem-100              │  │
│  │ ╱      ╲╱      ╲                                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  [Search...                          ]                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ #  │ Nama        │ Jabatan   │ Instansi  │ Waktu        ││
│  ├────┼─────────────┼───────────┼───────────┼──────────────┤│
│  │ 1  │ Ahmad F.    │ Kepala    │ Dinas X   │ 15 Jun 14:30 ││
│  │ 2  │ Budi S.     │ Staff     │ Dinas Y   │ 15 Jun 14:25 ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

Detail:
- Stat cards: bg white, rounded-xl, shadow-sm, left accent 3px berwarna (variasi kaem-500/400/success)
- Angka: font-3xl font-bold gray-900. Label: font-sm gray-500
- Chart: area chart dengan gradient fill kaem-100 → transparent, garis kaem-500, dot kaem-600
- Tabel: clean, zebra stripe subtle (gray-50 alternating), hover row kaem-50
- Row click: slide panel dari kanan (bukan modal) — detail response, lebih natural flow

---

## Motion & Interactions

```
Transitions (semua 150ms ease-out kecuali dinyatakan lain):
- Hover card: shadow + translateY(-1px)
- Button hover: background color shift
- Modal: fade 200ms + scale from 0.95
- Toast: slide-in dari kanan 300ms
- Page transition: content fade 150ms
- Drag: dnd-kit default + opacity 0.8 pada item
- Skeleton: pulse animation (Tailwind animate-pulse)
- Success checkmark: scale dari 0 ke 1 + fade (300ms)
```

Tidak ada animasi berat. Semua subtle, purpose-driven.

---

## Dark Mode (Opsional Future)

Jangan implementasi sekarang, tapi pastikan semua warna menggunakan CSS custom properties (bukan hardcoded Tailwind classes) agar mudah di-swap nanti:

```css
:root {
  --bg-page: theme('colors.gray.50');
  --bg-card: white;
  --bg-input: theme('colors.gray.50');
  --text-primary: theme('colors.gray.900');
  --text-secondary: theme('colors.gray.500');
  --border: theme('colors.gray.200');
}
```

Di komponen, prefer `bg-[var(--bg-card)]` — tapi untuk MVP, Tailwind classes langsung OK. Yang penting: jangan mix bg-white dan bg-gray-100 tanpa alasan. Konsisten.

---

## Implementasi di Tailwind Config

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        kaem: {
          50:  '#EBF5FF',
          100: '#D6EBFF',
          200: '#ADD6FF',
          300: '#7ABFFF',
          400: '#4DA3FF',
          500: '#2E86DE',
          600: '#1A6FCC',
          700: '#1456A8',
          800: '#0D3F7F',
          900: '#0A2D5C',
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'form': '0 8px 30px rgba(0,0,0,0.08)',
      }
    }
  }
}
```

---

## Checklist Redesign

Saat menjalankan prompt, pastikan perubahan ini diterapkan:

- [ ] Tailwind config: tambah warna kaem, shadow custom
- [ ] Navbar: gradient top bar 3px, logo+text, tier badge, avatar dropdown
- [ ] Dashboard: greeting, quick stats bar, workspace cards dengan left accent + hover lift
- [ ] Workspace: form list view (bukan grid), status dots, URL visible
- [ ] Builder canvas: bg gray-50, field cards white rounded-xl shadow, selected border-left kaem-500
- [ ] Builder palette: grouped, icons, hover kaem-50
- [ ] Builder props: empty state dengan ilustrasi, section dividers
- [ ] Form publik: gray-50 page bg, white card shadow-form, rounded-2xl, gradient divider
- [ ] Response dashboard: stat cards with accent, area chart, slide panel detail
- [ ] Buttons: kaem-600 primary, rounded-xl, height 40px (sm) 44px (md) 48px (lg)
- [ ] Inputs: bg gray-50, border gray-200, rounded-xl, focus:ring kaem-200
- [ ] Semua card: rounded-xl, shadow-card, hover shadow-card-hover
