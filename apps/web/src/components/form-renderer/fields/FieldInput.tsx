import { useTranslations } from "next-intl";
import { Input, Textarea } from "@/components/ui";
import { SignatureCanvas } from "@/components/shared/SignatureCanvas";
import { cn } from "@/lib/utils";
import type { FieldType, FormField, ResponseFieldValue, SignatureData } from "@kaemform/shared";

export interface FieldInputProps {
  field: FormField;
  value: ResponseFieldValue;
  onChange: (value: ResponseFieldValue) => void;
  error?: string;
  sectionMeta?: { index: number; total: number };
}

function TextInput({ field, value, onChange, error, type }: FieldInputProps & { type: string }) {
  return (
    <Input
      type={type}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || undefined}
      error={error}
    />
  );
}

function NumberInput({ field, value, onChange, error }: FieldInputProps) {
  return (
    <Input
      type="number"
      value={value === null || value === undefined ? "" : String(value)}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      placeholder={field.placeholder || undefined}
      min={field.validation?.min_value}
      max={field.validation?.max_value}
      error={error}
    />
  );
}

function LongTextInput({ field, value, onChange, error }: FieldInputProps) {
  return (
    <Textarea
      value={(value as string) ?? ""}
      onChange={(e) => {
        onChange(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      placeholder={field.placeholder || undefined}
      error={error}
    />
  );
}

function SingleChoiceInput({ field, value, onChange, error }: FieldInputProps) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {(field.options ?? []).map((option) => (
          <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-input border border-transparent px-2 py-2 text-sm text-slate-700 transition-colors hover:border-primary-100 hover:bg-primary-50">
            <input
              type="radio"
              name={field.id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 accent-primary-600"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function MultipleChoiceInput({ field, value, onChange, error }: FieldInputProps) {
  const selected = Array.isArray(value) ? (value as string[]) : [];

  const toggle = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      onChange([...selected, optionValue]);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        {(field.options ?? []).map((option) => (
          <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-input border border-transparent px-2 py-2 text-sm text-slate-700 transition-colors hover:border-primary-100 hover:bg-primary-50">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="h-4 w-4 accent-primary-600"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function DropdownInput({ field, value, onChange, error }: FieldInputProps) {
  return (
    <div>
      <select
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 w-full rounded-input border bg-slate-50 px-3.5 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100",
          error ? "border-error" : "border-border"
        )}
      >
        <option value="" disabled>
          {field.placeholder || ""}
        </option>
        {(field.options ?? []).map((option) => (
          <option key={option.id} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function ScaleInput({ field, value, onChange, error }: FieldInputProps) {
  const min = field.scaleMin ?? 1;
  const max = field.scaleMax ?? 5;
  const values = Array.from({ length: Math.max(max - min + 1, 0) }, (_, i) => min + i);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "flex h-10 min-w-10 items-center justify-center rounded-input border px-2 text-sm font-semibold transition-all",
              value === option
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-border bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50"
            )}
          >
            {option}
          </button>
        ))}
      </div>
      {(field.scaleMinLabel || field.scaleMaxLabel) && (
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{field.scaleMinLabel}</span>
          <span>{field.scaleMaxLabel}</span>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function SignatureInput({ value, onChange, error }: FieldInputProps) {
  return (
    <SignatureCanvas
      value={(value as SignatureData | null) ?? null}
      onChange={(data) => onChange(data)}
      error={error}
    />
  );
}

function SectionDisplay({ field, sectionMeta }: FieldInputProps) {
  const t = useTranslations("builder.canvas");

  return (
    <div className="overflow-hidden rounded-card border border-primary-100 bg-primary-50/35">
      {sectionMeta && (
        <div className="inline-flex rounded-br-input bg-primary-600 px-3 py-1.5 text-xs font-bold text-white">
          {t("sectionCount", { current: sectionMeta.index, total: sectionMeta.total })}
        </div>
      )}
      <div className="px-4 pb-4 pt-3">
        <h3 className="text-lg font-bold text-slate-900">{field.label}</h3>
        {field.description && <p className="mt-1 text-sm leading-6 text-slate-500">{field.description}</p>}
      </div>
    </div>
  );
}

function ParagraphDisplay({ field }: FieldInputProps) {
  return <p className="whitespace-pre-wrap text-sm text-gray-600">{field.content}</p>;
}

export const FieldRendererRegistry: Record<FieldType, (props: FieldInputProps) => React.JSX.Element> = {
  short_text: (props) => <TextInput {...props} type="text" />,
  long_text: (props) => <LongTextInput {...props} />,
  number: (props) => <NumberInput {...props} />,
  email: (props) => <TextInput {...props} type="email" />,
  phone: (props) => <TextInput {...props} type="tel" />,
  date: (props) => <TextInput {...props} type="date" />,
  time: (props) => <TextInput {...props} type="time" />,
  datetime: (props) => <TextInput {...props} type="datetime-local" />,
  single_choice: (props) => <SingleChoiceInput {...props} />,
  multiple_choice: (props) => <MultipleChoiceInput {...props} />,
  dropdown: (props) => <DropdownInput {...props} />,
  scale: (props) => <ScaleInput {...props} />,
  signature: (props) => <SignatureInput {...props} />,
  section: (props) => <SectionDisplay {...props} />,
  paragraph: (props) => <ParagraphDisplay {...props} />,
};

export const NON_INPUT_TYPES: FieldType[] = ["section", "paragraph"];
