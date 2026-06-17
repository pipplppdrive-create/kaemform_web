/** Category slugs for the 8 system templates (docs/BUSINESS.md). */
export const SYSTEM_TEMPLATE_CATEGORIES = [
  "absensi",
  "registrasi-event",
  "survei",
  "pendataan",
  "kuesioner",
  "daftar-hadir",
  "umum",
  "feedback",
] as const;

/** Templates 1, 4, 7, 8 are available to Free tier. */
export const FREE_TEMPLATE_CATEGORIES: string[] = [
  "absensi",
  "pendataan",
  "umum",
  "feedback",
];
