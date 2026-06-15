# KaemForm — PRD (Product Requirements Document)

## Ringkasan

**Nama:** KaemForm
**Tagline:** Formulir online yang fleksibel, hemat, dan mudah digunakan.
**Posisi:** Produk ke-3 ekosistem Kaemnur (setelah KaemPDF, KaemExcel).
**Domain:** form.kaemnur.com

## Masalah

- Google Forms terlalu sederhana untuk kebutuhan profesional.
- Typeform/JotForm terlalu mahal untuk pasar Indonesia.
- Tidak ada form platform yang terintegrasi workflow dokumen lokal (PDF/Word).
- Organisasi kecil butuh form yang bisa di-backup dan diarsipkan mandiri.

## Target Pengguna

| Segmen | Kebutuhan |
|---|---|
| Guru / Dosen | Absensi, kuesioner, pendataan siswa |
| Organisasi / Komunitas | Registrasi event, pendataan anggota |
| UMKM | Formulir pesanan, feedback |
| Freelancer / Konsultan | Survei, intake form klien |
| Instansi kecil | Formulir resmi dengan tanda tangan |

## Fitur MVP

1. Form builder — drag & drop, template, preview, conditional logic dasar
2. Form publik — URL pendek, responsif, bisa diisi tanpa login (default), login opsional
3. Response collection — real-time dashboard, summary
4. Workspace — organisasi form dalam grup
5. Tanda tangan — canvas drawing, disimpan sebagai stroke data JSON
6. Export — CSV + PDF tabel (web), PDF/Word advanced (desktop)
7. Retensi — auto-delete + pengingat email sebelum hapus
8. Auth — launch token dari Kaemnur + Google OAuth langsung
9. i18n — Indonesia default, struktur siap English

## Fitur Post-MVP

- Kolaborasi workspace multi-user
- Webhook & API publik
- Conditional logic lanjutan (multi-kondisi, kalkulasi)
- Custom theme & branding
- Template marketplace
- Integrasi KaemPDF (sertifikat dari response)
- Offline mode desktop
- QR code form
- Bahasa English

## Batasan Eksplisit

- Tidak ada upload file (MVP)
- Tidak ada kolaborasi real-time (MVP)
- Tidak ada payment collection
- Tidak ada multi-halaman dengan save progress (MVP)
- Desktop app = companion, bukan pengganti web

## Use Cases

**Absensi Harian:**
Guru membuat form absensi → publish → siswa isi dari HP → guru lihat dashboard → export CSV akhir bulan → backup via desktop.

**Registrasi Event:**
Komunitas buat form registrasi + tanda tangan persetujuan → share link → peserta daftar → panitia lihat data real-time → export PDF daftar peserta.

**Survei Kepuasan:**
Konsultan buat survei skala + teks → kirim ke klien → analisis response di dashboard → export laporan.
