# KaemForm — Business Rules, Tiers & Retention

## Pricing

**Lisensi Pro:** Rp 99.000/tahun — semua fitur aplikasi.
**Storage Add-on (opsional):** perpanjang retensi cloud.

| Add-on | Harga/tahun | Retensi |
|---|---|---|
| Storage 90 | Rp 29.000 | 90 hari |
| Storage 180 | Rp 49.000 | 180 hari |
| Storage 365 | Rp 79.000 | 365 hari |

## Tier Comparison

| Fitur | Free | Trial (14 hari) | Pro | Pro + Storage |
|---|---|---|---|---|
| Workspace | 1 | 3 | 5 | 5 |
| Form / workspace | 3 | Unlimited | Unlimited | Unlimited |
| Response / form | 50 | 1.000 | 10.000 | 10.000 |
| Retensi cloud | 30 hari | 90 hari | 30 hari | 90-365 hari |
| Conditional logic | ✗ | ✓ | ✓ | ✓ |
| Signature | ✗ | ✓ | ✓ | ✓ |
| Export CSV | ✓ | ✓ | ✓ | ✓ |
| Export PDF | ✗ | ✓ | ✓ | ✓ |
| Desktop app | ✗ | ✓ | ✓ | ✓ |
| Custom slug | ✗ | ✗ | ✓ | ✓ |
| Remove branding | ✗ | ✗ | ✓ | ✓ |
| Email notifikasi | ✗ | ✓ | ✓ | ✓ |
| Template semua | ✗ | ✓ | ✓ | ✓ |

## Feature Flags

Gunakan `useLicense()` hook. Feature keys:

| Key | Free | Trial | Pro |
|---|---|---|---|
| `conditional_logic` | ✗ | ✓ | ✓ |
| `signature` | ✗ | ✓ | ✓ |
| `export_pdf` | ✗ | ✓ | ✓ |
| `custom_slug` | ✗ | ✗ | ✓ |
| `remove_branding` | ✗ | ✗ | ✓ |
| `email_notification` | ✗ | ✓ | ✓ |
| `desktop_app` | ✗ | ✓ | ✓ |
| `all_templates` | ✗ | ✓ | ✓ |

Disabled features: tampil tapi disabled/grayed + badge "Pro" + klik → modal upgrade + link Kaemnur store.

## Limit Enforcement Points

| Action | Cek | Jika Limit |
|---|---|---|
| Buat workspace | count workspaces WHERE owner_id | Tolak + "Upgrade" |
| Buat form | count forms WHERE workspace_id | Tolak + "Upgrade" |
| Submit response | response_count vs limit | Auto-close form |
| Add signature field | license feature flag | Disabled di palette |
| Add conditional logic | license feature flag | Disabled di props |
| Export PDF | license feature flag | Tombol disabled |
| Custom slug | license feature flag | Input disabled |

## Retention Rules

| Tier | Default | Max | Source |
|---|---|---|---|
| Free | 30 | 30 | Built-in |
| Trial | 30 | 90 | Built-in |
| Pro | 30 | 30 | Built-in |
| Pro + Storage | addon value | addon value | Add-on |
| Desktop | ∞ | ∞ | Lokal |

### Retention Engine (cron harian)

```
1. T-7 hari: kirim email reminder (RetentionReminder)
2. T-1 hari: kirim email final (RetentionFinalReminder)
3. T-0: soft delete (SET deleted_at = now())
4. T+30 hari: hard delete (DELETE FROM responses)
5. Log semua aksi ke retention_logs
```

Deduplicate: cek retention_logs sebelum kirim email — jangan kirim ulang jika sudah kirim reminder untuk form yang sama dalam 6 hari terakhir.

## License Lifecycle

```
Beli lisensi di Kaemnur Store
→ License active (Pro)
→ 1 tahun kemudian: license expired
→ Fitur turun ke Free tier
→ Desktop app: read-only data lokal (tidak bisa sync baru)
→ Data cloud: sesuai retensi (jika storage addon juga expired → 30 hari)
→ Perpanjang: bayar lagi di Kaemnur Store → instant upgrade
```

## Conversion Funnel

```
Free → Trial:  Prompt di fitur locked: "Coba gratis 14 hari"
Trial → Pro:   Email T-3 hari: "Trial berakhir, lanjutkan Rp 99.000/tahun"
Pro → Storage:  Email retensi: "Data akan dihapus. Perpanjang dengan Storage Add-on."
```

## 8 System Templates (Seed Data)

1. **Absensi Harian** — nama, kelas/divisi, tanggal, status hadir (choice), keterangan
2. **Registrasi Event** — nama, email, telepon, institusi, sesi pilihan (dropdown), persetujuan (signature)
3. **Survei Kepuasan** — skala 1-5 (5 pertanyaan), saran (long_text)
4. **Formulir Pendataan** — nama, NIK, TTL, alamat, telepon, email
5. **Kuesioner Penelitian** — 8-10 pertanyaan campuran (choice, scale, text)
6. **Daftar Hadir** — nama, jabatan, instansi, tanda tangan, waktu
7. **Formulir Umum** — nama, email, subjek (dropdown), pesan (long_text)
8. **Feedback** — rating keseluruhan (scale), apa yang disukai (long_text), saran perbaikan (long_text)

Free tier: hanya template 1, 4, 7, 8. Trial/Pro: semua.
