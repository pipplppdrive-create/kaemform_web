import type { FieldType, FormField } from "../types/form";

export type FieldGroup = "text" | "choice" | "input" | "time" | "other";

export interface FieldTypeDef {
  type: FieldType;
  group: FieldGroup;
  icon: string;
  label: { id: string; en: string };
  defaults: (id: string, order: number) => FormField;
}

const base = (
  id: string,
  type: FieldType,
  order: number,
  label: string,
  extra: Partial<FormField> = {}
): FormField => ({
  id,
  type,
  label,
  description: "",
  required: false,
  order,
  group: null,
  ...extra,
});

export const FIELD_TYPES: FieldTypeDef[] = [
  {
    type: "short_text",
    group: "text",
    icon: "Type",
    label: { id: "Teks Singkat", en: "Short Text" },
    defaults: (id, order) =>
      base(id, "short_text", order, "Field Baru", {
        placeholder: "",
        validation: {},
      }),
  },
  {
    type: "long_text",
    group: "text",
    icon: "AlignLeft",
    label: { id: "Teks Panjang", en: "Long Text" },
    defaults: (id, order) =>
      base(id, "long_text", order, "Field Baru", {
        placeholder: "",
        validation: {},
      }),
  },
  {
    type: "number",
    group: "input",
    icon: "Hash",
    label: { id: "Angka", en: "Number" },
    defaults: (id, order) =>
      base(id, "number", order, "Field Baru", {
        placeholder: "",
        validation: {},
      }),
  },
  {
    type: "email",
    group: "input",
    icon: "Mail",
    label: { id: "Email", en: "Email" },
    defaults: (id, order) =>
      base(id, "email", order, "Email", { placeholder: "nama@email.com" }),
  },
  {
    type: "phone",
    group: "input",
    icon: "Phone",
    label: { id: "Telepon", en: "Phone" },
    defaults: (id, order) =>
      base(id, "phone", order, "Nomor Telepon", { placeholder: "08xxxxxxxxxx" }),
  },
  {
    type: "date",
    group: "time",
    icon: "Calendar",
    label: { id: "Tanggal", en: "Date" },
    defaults: (id, order) => base(id, "date", order, "Tanggal"),
  },
  {
    type: "time",
    group: "time",
    icon: "Clock",
    label: { id: "Waktu", en: "Time" },
    defaults: (id, order) => base(id, "time", order, "Waktu"),
  },
  {
    type: "datetime",
    group: "time",
    icon: "CalendarClock",
    label: { id: "Tanggal & Waktu", en: "Date & Time" },
    defaults: (id, order) => base(id, "datetime", order, "Tanggal & Waktu"),
  },
  {
    type: "single_choice",
    group: "choice",
    icon: "CircleDot",
    label: { id: "Pilihan Tunggal", en: "Single Choice" },
    defaults: (id, order) =>
      base(id, "single_choice", order, "Pilihan", {
        options: [
          { id: `${id}_opt1`, label: "Opsi 1", value: "Opsi 1" },
          { id: `${id}_opt2`, label: "Opsi 2", value: "Opsi 2" },
        ],
      }),
  },
  {
    type: "multiple_choice",
    group: "choice",
    icon: "CheckSquare",
    label: { id: "Pilihan Ganda", en: "Multiple Choice" },
    defaults: (id, order) =>
      base(id, "multiple_choice", order, "Pilihan", {
        options: [
          { id: `${id}_opt1`, label: "Opsi 1", value: "Opsi 1" },
          { id: `${id}_opt2`, label: "Opsi 2", value: "Opsi 2" },
        ],
      }),
  },
  {
    type: "dropdown",
    group: "choice",
    icon: "List",
    label: { id: "Dropdown", en: "Dropdown" },
    defaults: (id, order) =>
      base(id, "dropdown", order, "Pilihan", {
        options: [
          { id: `${id}_opt1`, label: "Opsi 1", value: "Opsi 1" },
          { id: `${id}_opt2`, label: "Opsi 2", value: "Opsi 2" },
        ],
      }),
  },
  {
    type: "scale",
    group: "other",
    icon: "SlidersHorizontal",
    label: { id: "Skala", en: "Scale" },
    defaults: (id, order) =>
      base(id, "scale", order, "Skala", {
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: "",
        scaleMaxLabel: "",
      }),
  },
  {
    type: "signature",
    group: "other",
    icon: "PenLine",
    label: { id: "Tanda Tangan", en: "Signature" },
    defaults: (id, order) => base(id, "signature", order, "Tanda Tangan"),
  },
  {
    type: "section",
    group: "other",
    icon: "Heading",
    label: { id: "Bagian", en: "Section" },
    defaults: (id, order) =>
      base(id, "section", order, "Judul Bagian", { description: "" }),
  },
  {
    type: "paragraph",
    group: "text",
    icon: "Pilcrow",
    label: { id: "Paragraf", en: "Paragraph" },
    defaults: (id, order) =>
      base(id, "paragraph", order, "Paragraf", {
        content: "Tulis teks di sini.",
      }),
  },
];

export const FIELD_TYPE_GROUPS: { key: FieldGroup; label: { id: string; en: string } }[] = [
  { key: "text", label: { id: "Teks", en: "Text" } },
  { key: "choice", label: { id: "Pilihan", en: "Choice" } },
  { key: "input", label: { id: "Input", en: "Input" } },
  { key: "time", label: { id: "Waktu", en: "Time" } },
  { key: "other", label: { id: "Lainnya", en: "Other" } },
];

export const getFieldTypeDef = (type: FieldType): FieldTypeDef =>
  FIELD_TYPES.find((f) => f.type === type) as FieldTypeDef;
