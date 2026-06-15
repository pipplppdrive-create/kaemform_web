import { useTranslations } from "next-intl";
import { Input, Textarea } from "@/components/ui";
import type { FieldType, FormField } from "@kaemform/shared";

interface FieldPreviewProps {
  field: FormField;
}

function TextPreview({ field, type }: { field: FormField; type: string }) {
  return <Input type={type} disabled placeholder={field.placeholder || undefined} />;
}

function LongTextPreview({ field }: FieldPreviewProps) {
  return <Textarea disabled placeholder={field.placeholder || undefined} />;
}

function ChoicePreview({ field, kind }: { field: FormField; kind: "radio" | "checkbox" }) {
  return (
    <div className="flex flex-col gap-2">
      {(field.options ?? []).map((option) => (
        <label key={option.id} className="flex items-center gap-2 text-sm text-gray-700">
          <input type={kind} disabled className="h-4 w-4" />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function DropdownPreview({ field }: FieldPreviewProps) {
  return (
    <select disabled className="h-10 w-full rounded-input border border-border bg-white px-3 text-sm text-gray-500">
      <option>{field.options?.[0]?.label ?? ""}</option>
    </select>
  );
}

function ScalePreview({ field }: FieldPreviewProps) {
  const min = field.scaleMin ?? 1;
  const max = field.scaleMax ?? 5;
  const values = Array.from({ length: Math.max(max - min + 1, 0) }, (_, i) => min + i);

  return (
    <div>
      <div className="flex gap-2">
        {values.map((value) => (
          <div
            key={value}
            className="flex h-9 w-9 items-center justify-center rounded-input border border-border text-sm text-gray-500"
          >
            {value}
          </div>
        ))}
      </div>
      {(field.scaleMinLabel || field.scaleMaxLabel) && (
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{field.scaleMinLabel}</span>
          <span>{field.scaleMaxLabel}</span>
        </div>
      )}
    </div>
  );
}

function SignaturePreview() {
  const t = useTranslations("signature");
  return (
    <div className="flex h-24 items-center justify-center rounded-input border border-dashed border-border text-sm text-gray-400">
      {t("placeholder")}
    </div>
  );
}

function SectionPreview({ field }: FieldPreviewProps) {
  return (
    <div className="border-b border-border pb-2">
      <h3 className="text-base font-semibold text-gray-900">{field.label}</h3>
      {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
    </div>
  );
}

function ParagraphPreview({ field }: FieldPreviewProps) {
  return <p className="whitespace-pre-wrap text-sm text-gray-600">{field.content}</p>;
}

export const FieldBuilderRegistry: Record<FieldType, (props: FieldPreviewProps) => React.JSX.Element> = {
  short_text: (props) => <TextPreview {...props} type="text" />,
  long_text: (props) => <LongTextPreview {...props} />,
  number: (props) => <TextPreview {...props} type="number" />,
  email: (props) => <TextPreview {...props} type="email" />,
  phone: (props) => <TextPreview {...props} type="tel" />,
  date: (props) => <TextPreview {...props} type="date" />,
  time: (props) => <TextPreview {...props} type="time" />,
  datetime: (props) => <TextPreview {...props} type="datetime-local" />,
  single_choice: (props) => <ChoicePreview {...props} kind="radio" />,
  multiple_choice: (props) => <ChoicePreview {...props} kind="checkbox" />,
  dropdown: (props) => <DropdownPreview {...props} />,
  scale: (props) => <ScalePreview {...props} />,
  signature: () => <SignaturePreview />,
  section: (props) => <SectionPreview {...props} />,
  paragraph: (props) => <ParagraphPreview {...props} />,
};

export function FieldPreview({ field }: FieldPreviewProps) {
  const Component = FieldBuilderRegistry[field.type];
  return <Component field={field} />;
}

export const NO_LABEL_TYPES: FieldType[] = ["section", "paragraph"];
