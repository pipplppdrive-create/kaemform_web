import type { FieldOption, FormSchema, FormSettings, FormTemplate } from "@kaemform/shared";
import { PROVINSI_514 } from "@/data/wilayah-514";

export const DAFTAR_HADIR_514_TEMPLATE_ID = "51400000-0000-4000-8000-000000000514";

const FIELD_IDS = {
  namaLengkap: "daftar-514-nama-lengkap",
  nik: "daftar-514-nik",
  nomorIdentitas: "daftar-514-nomor-identitas",
  instansi: "daftar-514-instansi",
  jabatan: "daftar-514-jabatan",
  provinsi: "daftar-514-provinsi",
  kabKota: "daftar-514-kab-kota",
  nomorHp: "daftar-514-nomor-hp",
  email: "daftar-514-email",
  tandaTangan: "daftar-514-tanda-tangan",
} as const;

function createOptions(values: string[], prefix: string): FieldOption[] {
  return values.map((value, index) => ({
    id: `${prefix}-${String(index + 1).padStart(3, "0")}`,
    label: value,
    value,
  }));
}

export const DAFTAR_HADIR_514_SCHEMA: FormSchema = [
  {
    id: FIELD_IDS.namaLengkap,
    type: "short_text",
    label: "Nama Lengkap",
    placeholder: "Nama lengkap",
    required: true,
    order: 1,
  },
  {
    id: FIELD_IDS.nik,
    type: "short_text",
    label: "NIK",
    placeholder: "Nomor Induk Kependudukan",
    required: false,
    order: 2,
  },
  {
    id: FIELD_IDS.nomorIdentitas,
    type: "short_text",
    label: "NIP/NUPTK/Nomor Identitas",
    placeholder: "NIP, NUPTK, atau nomor identitas lain",
    required: false,
    order: 3,
  },
  {
    id: FIELD_IDS.instansi,
    type: "short_text",
    label: "Instansi/Satuan Pendidikan",
    placeholder: "Nama instansi atau satuan pendidikan",
    required: false,
    order: 4,
  },
  {
    id: FIELD_IDS.jabatan,
    type: "short_text",
    label: "Jabatan",
    placeholder: "Jabatan / posisi",
    required: false,
    order: 5,
  },
  {
    id: FIELD_IDS.provinsi,
    type: "dropdown",
    label: "Provinsi",
    placeholder: "Pilih provinsi",
    required: true,
    order: 6,
    options: createOptions(PROVINSI_514, "provinsi-514"),
  },
  {
    id: FIELD_IDS.kabKota,
    type: "dropdown",
    label: "Kabupaten/Kota",
    placeholder: "Pilih kabupaten/kota",
    required: true,
    order: 7,
    dependent: {
      field_id: FIELD_IDS.provinsi,
      source: "wilayah-514-kabkota",
      placeholder: "Pilih kabupaten/kota",
      disabled_placeholder: "Pilih provinsi terlebih dahulu",
    },
  },
  {
    id: FIELD_IDS.nomorHp,
    type: "phone",
    label: "Nomor HP",
    placeholder: "Nomor HP aktif",
    required: false,
    order: 8,
  },
  {
    id: FIELD_IDS.email,
    type: "email",
    label: "Email",
    placeholder: "nama@email.com",
    required: false,
    order: 9,
  },
  {
    id: FIELD_IDS.tandaTangan,
    type: "signature",
    label: "Tanda Tangan",
    required: false,
    order: 10,
  },
];

const DAFTAR_HADIR_514_SETTINGS: Partial<FormSettings> = {
  show_progress_bar: true,
  section_mode: "single",
  success_message: "Terima kasih, daftar hadir Anda telah tersimpan.",
};

export const STATIC_SYSTEM_TEMPLATES: FormTemplate[] = [
  {
    id: DAFTAR_HADIR_514_TEMPLATE_ID,
    title: "Daftar Hadir 514 Kab/kota",
    description: "Template daftar hadir dengan pilihan provinsi dan kabupaten/kota seluruh Indonesia.",
    category: "absensi",
    schema: DAFTAR_HADIR_514_SCHEMA,
    settings: DAFTAR_HADIR_514_SETTINGS,
    is_system: true,
    created_by: null,
    usage_count: 0,
    created_at: "2026-06-17T00:00:00.000Z",
  },
];

export function getStaticSystemTemplate(templateId: string): FormTemplate | undefined {
  return STATIC_SYSTEM_TEMPLATES.find((template) => template.id === templateId);
}

export function cloneTemplateSchema(schema: FormSchema): FormSchema {
  return structuredClone(schema);
}

export function cloneTemplateSettings(settings: Partial<FormSettings>): Partial<FormSettings> {
  return structuredClone(settings);
}
