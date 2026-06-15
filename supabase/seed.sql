-- KaemForm — 8 System Templates (docs/BUSINESS.md "8 System Templates")
-- Free tier: templates 1 (absensi), 4 (pendataan), 7 (umum), 8 (feedback)

insert into form_templates (title, description, category, schema, settings, is_system, usage_count)
values
-- 1. Absensi Harian
(
  'Absensi Harian',
  'Formulir absensi harian untuk kelas, divisi, atau tim.',
  'absensi',
  '[
    {"id":"field_absensi_1","type":"short_text","label":"Nama","required":true,"order":1,"placeholder":"Masukkan nama lengkap"},
    {"id":"field_absensi_2","type":"short_text","label":"Kelas / Divisi","required":true,"order":2,"placeholder":"Contoh: Kelas 5A"},
    {"id":"field_absensi_3","type":"date","label":"Tanggal","required":true,"order":3},
    {"id":"field_absensi_4","type":"single_choice","label":"Status Hadir","required":true,"order":4,"options":[{"id":"field_absensi_4_opt1","label":"Hadir","value":"Hadir"},{"id":"field_absensi_4_opt2","label":"Izin","value":"Izin"},{"id":"field_absensi_4_opt3","label":"Sakit","value":"Sakit"},{"id":"field_absensi_4_opt4","label":"Alpha","value":"Alpha"}]},
    {"id":"field_absensi_5","type":"long_text","label":"Keterangan","required":false,"order":5,"placeholder":"Keterangan tambahan (opsional)"}
  ]'::jsonb,
  '{}'::jsonb,
  true,
  0
),
-- 2. Registrasi Event
(
  'Registrasi Event',
  'Formulir pendaftaran peserta acara dengan persetujuan tanda tangan.',
  'registrasi-event',
  '[
    {"id":"field_event_1","type":"short_text","label":"Nama Lengkap","required":true,"order":1,"placeholder":"Masukkan nama lengkap"},
    {"id":"field_event_2","type":"email","label":"Email","required":true,"order":2,"placeholder":"nama@email.com"},
    {"id":"field_event_3","type":"phone","label":"Nomor Telepon","required":true,"order":3,"placeholder":"08xxxxxxxxxx"},
    {"id":"field_event_4","type":"short_text","label":"Institusi / Organisasi","required":false,"order":4,"placeholder":"Nama institusi"},
    {"id":"field_event_5","type":"dropdown","label":"Sesi yang Diikuti","required":true,"order":5,"options":[{"id":"field_event_5_opt1","label":"Sesi Pagi","value":"Sesi Pagi"},{"id":"field_event_5_opt2","label":"Sesi Siang","value":"Sesi Siang"},{"id":"field_event_5_opt3","label":"Sesi Sore","value":"Sesi Sore"}]},
    {"id":"field_event_6","type":"signature","label":"Tanda Tangan Persetujuan","description":"Saya menyetujui syarat dan ketentuan acara ini.","required":true,"order":6}
  ]'::jsonb,
  '{}'::jsonb,
  true,
  0
),
-- 3. Survei Kepuasan
(
  'Survei Kepuasan',
  'Survei kepuasan pelanggan dengan skala penilaian 1-5.',
  'survei',
  '[
    {"id":"field_survei_1","type":"scale","label":"Kepuasan terhadap pelayanan","required":true,"order":1,"scaleMin":1,"scaleMax":5,"scaleMinLabel":"Sangat Tidak Puas","scaleMaxLabel":"Sangat Puas"},
    {"id":"field_survei_2","type":"scale","label":"Kepuasan terhadap kualitas produk","required":true,"order":2,"scaleMin":1,"scaleMax":5,"scaleMinLabel":"Sangat Tidak Puas","scaleMaxLabel":"Sangat Puas"},
    {"id":"field_survei_3","type":"scale","label":"Kecepatan respon","required":true,"order":3,"scaleMin":1,"scaleMax":5,"scaleMinLabel":"Sangat Lambat","scaleMaxLabel":"Sangat Cepat"},
    {"id":"field_survei_4","type":"scale","label":"Keramahan staf","required":true,"order":4,"scaleMin":1,"scaleMax":5,"scaleMinLabel":"Sangat Tidak Ramah","scaleMaxLabel":"Sangat Ramah"},
    {"id":"field_survei_5","type":"scale","label":"Kemungkinan merekomendasikan ke orang lain","required":true,"order":5,"scaleMin":1,"scaleMax":5,"scaleMinLabel":"Tidak Mungkin","scaleMaxLabel":"Sangat Mungkin"},
    {"id":"field_survei_6","type":"long_text","label":"Saran dan Masukan","required":false,"order":6,"placeholder":"Tuliskan saran Anda"}
  ]'::jsonb,
  '{}'::jsonb,
  true,
  0
),
-- 4. Formulir Pendataan
(
  'Formulir Pendataan',
  'Formulir pendataan identitas dan kontak.',
  'pendataan',
  '[
    {"id":"field_pendataan_1","type":"short_text","label":"Nama Lengkap","required":true,"order":1,"placeholder":"Sesuai KTP"},
    {"id":"field_pendataan_2","type":"short_text","label":"NIK","required":true,"order":2,"placeholder":"16 digit NIK","validation":{"min_length":16,"max_length":16}},
    {"id":"field_pendataan_3","type":"short_text","label":"Tempat Lahir","required":true,"order":3,"placeholder":"Kota kelahiran"},
    {"id":"field_pendataan_4","type":"date","label":"Tanggal Lahir","required":true,"order":4},
    {"id":"field_pendataan_5","type":"long_text","label":"Alamat","required":true,"order":5,"placeholder":"Alamat lengkap sesuai domisili"},
    {"id":"field_pendataan_6","type":"phone","label":"Nomor Telepon","required":true,"order":6,"placeholder":"08xxxxxxxxxx"},
    {"id":"field_pendataan_7","type":"email","label":"Email","required":false,"order":7,"placeholder":"nama@email.com"}
  ]'::jsonb,
  '{}'::jsonb,
  true,
  0
),
-- 5. Kuesioner Penelitian
(
  'Kuesioner Penelitian',
  'Kuesioner penelitian dengan campuran pertanyaan pilihan, skala, dan teks.',
  'kuesioner',
  '[
    {"id":"field_kuesioner_1","type":"short_text","label":"Nama Responden","required":false,"order":1,"placeholder":"Boleh dikosongkan jika anonim"},
    {"id":"field_kuesioner_2","type":"number","label":"Usia","required":true,"order":2,"placeholder":"Tahun","validation":{"min_value":1,"max_value":120}},
    {"id":"field_kuesioner_3","type":"single_choice","label":"Jenis Kelamin","required":true,"order":3,"options":[{"id":"field_kuesioner_3_opt1","label":"Laki-laki","value":"Laki-laki"},{"id":"field_kuesioner_3_opt2","label":"Perempuan","value":"Perempuan"}]},
    {"id":"field_kuesioner_4","type":"dropdown","label":"Pendidikan Terakhir","required":true,"order":4,"options":[{"id":"field_kuesioner_4_opt1","label":"SD","value":"SD"},{"id":"field_kuesioner_4_opt2","label":"SMP","value":"SMP"},{"id":"field_kuesioner_4_opt3","label":"SMA/SMK","value":"SMA/SMK"},{"id":"field_kuesioner_4_opt4","label":"Diploma","value":"Diploma"},{"id":"field_kuesioner_4_opt5","label":"S1/S2/S3","value":"S1/S2/S3"}]},
    {"id":"field_kuesioner_5","type":"scale","label":"Seberapa sering Anda menggunakan layanan ini?","required":true,"order":5,"scaleMin":1,"scaleMax":5,"scaleMinLabel":"Tidak Pernah","scaleMaxLabel":"Sangat Sering"},
    {"id":"field_kuesioner_6","type":"scale","label":"Seberapa besar manfaat yang Anda rasakan?","required":true,"order":6,"scaleMin":1,"scaleMax":5,"scaleMinLabel":"Tidak Bermanfaat","scaleMaxLabel":"Sangat Bermanfaat"},
    {"id":"field_kuesioner_7","type":"single_choice","label":"Apakah Anda akan menggunakan layanan ini lagi?","required":true,"order":7,"options":[{"id":"field_kuesioner_7_opt1","label":"Ya","value":"Ya"},{"id":"field_kuesioner_7_opt2","label":"Tidak","value":"Tidak"},{"id":"field_kuesioner_7_opt3","label":"Mungkin","value":"Mungkin"}]},
    {"id":"field_kuesioner_8","type":"long_text","label":"Saran untuk perbaikan","required":false,"order":8,"placeholder":"Tuliskan saran Anda"}
  ]'::jsonb,
  '{}'::jsonb,
  true,
  0
),
-- 6. Daftar Hadir
(
  'Daftar Hadir',
  'Formulir daftar hadir dengan tanda tangan.',
  'daftar-hadir',
  '[
    {"id":"field_hadir_1","type":"short_text","label":"Nama","required":true,"order":1,"placeholder":"Nama lengkap"},
    {"id":"field_hadir_2","type":"short_text","label":"Jabatan","required":true,"order":2,"placeholder":"Jabatan / posisi"},
    {"id":"field_hadir_3","type":"short_text","label":"Instansi","required":true,"order":3,"placeholder":"Nama instansi"},
    {"id":"field_hadir_4","type":"time","label":"Waktu Hadir","required":true,"order":4},
    {"id":"field_hadir_5","type":"signature","label":"Tanda Tangan","required":true,"order":5}
  ]'::jsonb,
  '{}'::jsonb,
  true,
  0
),
-- 7. Formulir Umum
(
  'Formulir Umum',
  'Formulir kontak / pesan umum.',
  'umum',
  '[
    {"id":"field_umum_1","type":"short_text","label":"Nama","required":true,"order":1,"placeholder":"Nama lengkap"},
    {"id":"field_umum_2","type":"email","label":"Email","required":true,"order":2,"placeholder":"nama@email.com"},
    {"id":"field_umum_3","type":"phone","label":"Nomor Telepon","required":false,"order":3,"placeholder":"08xxxxxxxxxx"},
    {"id":"field_umum_4","type":"dropdown","label":"Subjek","required":true,"order":4,"options":[{"id":"field_umum_4_opt1","label":"Pertanyaan","value":"Pertanyaan"},{"id":"field_umum_4_opt2","label":"Keluhan","value":"Keluhan"},{"id":"field_umum_4_opt3","label":"Saran","value":"Saran"},{"id":"field_umum_4_opt4","label":"Lainnya","value":"Lainnya"}]},
    {"id":"field_umum_5","type":"long_text","label":"Pesan","required":true,"order":5,"placeholder":"Tuliskan pesan Anda"}
  ]'::jsonb,
  '{}'::jsonb,
  true,
  0
),
-- 8. Feedback
(
  'Feedback',
  'Formulir feedback singkat dengan rating dan saran.',
  'feedback',
  '[
    {"id":"field_feedback_1","type":"short_text","label":"Nama","required":false,"order":1,"placeholder":"Boleh dikosongkan"},
    {"id":"field_feedback_2","type":"email","label":"Email","required":false,"order":2,"placeholder":"nama@email.com"},
    {"id":"field_feedback_3","type":"scale","label":"Rating Keseluruhan","required":true,"order":3,"scaleMin":1,"scaleMax":5,"scaleMinLabel":"Buruk","scaleMaxLabel":"Sangat Baik"},
    {"id":"field_feedback_4","type":"long_text","label":"Apa yang Anda sukai?","required":false,"order":4,"placeholder":"Ceritakan pengalaman positif Anda"},
    {"id":"field_feedback_5","type":"long_text","label":"Saran Perbaikan","required":false,"order":5,"placeholder":"Apa yang bisa kami tingkatkan?"}
  ]'::jsonb,
  '{}'::jsonb,
  true,
  0
),
-- 9. Biodata 2026
(
  'Biodata 2026',
  'Formulir biodata pegawai/instansi lengkap dengan data pribadi, data instansi, dan riwayat kegiatan.',
  'biodata',
  '[
    {"id":"field_biodata_1","type":"section","label":"Data Pribadi","required":false,"order":1},
    {"id":"field_biodata_2","type":"short_text","label":"Nama Lengkap","required":true,"order":2,"placeholder":"Masukkan nama lengkap"},
    {"id":"field_biodata_3","type":"short_text","label":"Tempat, Tanggal Lahir","required":true,"order":3,"placeholder":"Contoh: Jakarta, 17 Agustus 1990"},
    {"id":"field_biodata_4","type":"short_text","label":"NIP","required":true,"order":4,"placeholder":"Nomor Induk Pegawai"},
    {"id":"field_biodata_5","type":"short_text","label":"Pangkat / Golongan","required":true,"order":5,"placeholder":"Contoh: Penata Muda / III-a"},
    {"id":"field_biodata_6","type":"single_choice","label":"Jenis Kelamin","required":true,"order":6,"options":[{"id":"field_biodata_6_opt1","label":"Laki-laki","value":"Laki-laki"},{"id":"field_biodata_6_opt2","label":"Perempuan","value":"Perempuan"}]},
    {"id":"field_biodata_7","type":"dropdown","label":"Agama","required":true,"order":7,"options":[{"id":"field_biodata_7_opt1","label":"Islam","value":"Islam"},{"id":"field_biodata_7_opt2","label":"Kristen Protestan","value":"Kristen Protestan"},{"id":"field_biodata_7_opt3","label":"Katolik","value":"Katolik"},{"id":"field_biodata_7_opt4","label":"Hindu","value":"Hindu"},{"id":"field_biodata_7_opt5","label":"Buddha","value":"Buddha"},{"id":"field_biodata_7_opt6","label":"Konghucu","value":"Konghucu"},{"id":"field_biodata_7_opt7","label":"Lainnya","value":"Lainnya"}]},
    {"id":"field_biodata_8","type":"section","label":"Data Instansi","required":false,"order":8},
    {"id":"field_biodata_9","type":"short_text","label":"Instansi","required":true,"order":9,"placeholder":"Nama instansi"},
    {"id":"field_biodata_10","type":"short_text","label":"Unit Kerja","required":true,"order":10,"placeholder":"Nama unit kerja"},
    {"id":"field_biodata_11","type":"long_text","label":"Alamat Instansi","required":true,"order":11,"placeholder":"Alamat lengkap instansi"},
    {"id":"field_biodata_12","type":"short_text","label":"Telepon / Fax Instansi","required":false,"order":12,"placeholder":"Nomor telepon / fax instansi"},
    {"id":"field_biodata_13","type":"email","label":"Alamat Email","required":true,"order":13,"placeholder":"nama@email.com"},
    {"id":"field_biodata_14","type":"phone","label":"No. Telp / HP","required":true,"order":14,"placeholder":"08xxxxxxxxxx"},
    {"id":"field_biodata_15","type":"section","label":"Identitas Tambahan","required":false,"order":15},
    {"id":"field_biodata_16","type":"short_text","label":"No. KTP","required":true,"order":16,"placeholder":"16 digit NIK","validation":{"min_length":16,"max_length":16}},
    {"id":"field_biodata_17","type":"section","label":"Riwayat Kegiatan","required":false,"order":17},
    {"id":"field_biodata_18","type":"long_text","label":"Telah mengikuti kegiatan","required":false,"order":18,"placeholder":"Sebutkan kegiatan yang pernah diikuti"},
    {"id":"field_biodata_19","type":"signature","label":"Tanda Tangan","required":true,"order":19}
  ]'::jsonb,
  '{}'::jsonb,
  true,
  0
);
