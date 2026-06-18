"use client";

import type { ClipboardEvent } from "react";
import { useTranslations } from "next-intl";
import { nanoid } from "nanoid";
import { MousePointerClick, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import type { ConditionAction, ConditionOperator, FieldOption, FormField, FormSettings } from "@kaemform/shared";
import { Badge, Input, Textarea, Switch, Button } from "@/components/ui";
import { useFormBuilderStore } from "@/stores/formBuilderStore";

const CHOICE_TYPES: FormField["type"][] = ["single_choice", "multiple_choice", "dropdown"];
const NON_REFERENCEABLE_TYPES: FormField["type"][] = ["section", "paragraph", "signature"];
const SCORABLE_TYPES: FormField["type"][] = [
  "short_text",
  "long_text",
  "number",
  "email",
  "phone",
  "date",
  "time",
  "datetime",
  "single_choice",
  "multiple_choice",
  "dropdown",
  "scale",
];
const CONDITION_OPERATORS: ConditionOperator[] = ["equals", "not_equals", "contains", "is_empty", "is_not_empty"];
const DEFAULT_OPTION_LABEL_PATTERN = /^(opsi|option)\s+\d+$/i;

function toNumberOrUndefined(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}

function isChoiceField(field: FormField | undefined): boolean {
  return !!field && CHOICE_TYPES.includes(field.type);
}

function OptionsEditor({ field, onChange }: { field: FormField; onChange: (options: FieldOption[]) => void }) {
  const t = useTranslations("builder.props");
  const options = field.options ?? [];

  const createOption = (label: string, id = nanoid(6)): FieldOption => ({
    id,
    label,
    value: label,
  });

  const isDisposableOption = (option: FieldOption, index: number) => {
    const label = option.label.trim();
    return !label || label === t("optionLabel", { n: index + 1 }) || DEFAULT_OPTION_LABEL_PATTERN.test(label);
  };

  const splitPastedOptions = (value: string) =>
    value
      .split(/[,\r\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);

  const updateOption = (id: string, label: string) => {
    onChange(options.map((o) => (o.id === id ? { ...o, label, value: label } : o)));
  };

  const pasteOptions = (id: string, value: string) => {
    const labels = splitPastedOptions(value);
    if (labels.length <= 1) return false;

    const targetIndex = options.findIndex((option) => option.id === id);
    if (targetIndex < 0) return false;

    let nextIndex = targetIndex + 1;
    const pastedOptions = labels.map((label, labelIndex) => {
      if (labelIndex === 0) {
        return createOption(label, id);
      }

      const reusable = options[nextIndex];
      if (reusable && isDisposableOption(reusable, nextIndex)) {
        nextIndex += 1;
        return createOption(label, reusable.id);
      }

      return createOption(label);
    });

    onChange([...options.slice(0, targetIndex), ...pastedOptions, ...options.slice(nextIndex)]);
    return true;
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, id: string) => {
    if (pasteOptions(id, event.clipboardData.getData("text"))) {
      event.preventDefault();
    }
  };

  const removeOption = (id: string) => {
    onChange(options.filter((o) => o.id !== id));
  };

  const addOption = () => {
    const label = t("optionLabel", { n: options.length + 1 });
    onChange([...options, { id: nanoid(6), label, value: label }]);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{t("options")}</label>
      {options.map((option) => (
        <div key={option.id} className="flex items-center gap-2">
          <Input
            value={option.label}
            onChange={(e) => updateOption(option.id, e.target.value)}
            onPaste={(e) => handlePaste(e, option.id)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => removeOption(option.id)}
            disabled={options.length <= 2}
            className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-error disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Remove option"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addOption}>
        <Plus className="h-4 w-4" />
        {t("addOption")}
      </Button>
    </div>
  );
}

function ConditionsEditor({
  field,
  fields,
  onChange,
  canUse,
  onLockedClick,
}: {
  field: FormField;
  fields: FormField[];
  onChange: (conditions: FormField["conditions"]) => void;
  canUse: boolean;
  onLockedClick: () => void;
}) {
  const t = useTranslations("builder.props.conditions");
  const tCommon = useTranslations("common");
  const condition = field.conditions?.[0];

  const referenceable = fields.filter(
    (f) => f.order < field.order && !NON_REFERENCEABLE_TYPES.includes(f.type)
  );
  const referenceField = condition ? referenceable.find((f) => f.id === condition.field_id) : undefined;
  const referenceOptions = referenceField?.options ?? [];
  const needsConditionValue =
    condition?.operator !== "is_empty" && condition?.operator !== "is_not_empty";

  const getDefaultConditionValue = (targetField: FormField | undefined) => {
    return targetField?.options?.[0]?.value ?? "";
  };

  const toggle = (enabled: boolean) => {
    if (!enabled) {
      onChange([]);
      return;
    }
    const first = referenceable[0];
    onChange(first ? [{ field_id: first.id, operator: "equals", value: getDefaultConditionValue(first), action: "show" }] : []);
  };

  const update = (partial: Partial<NonNullable<FormField["conditions"]>[number]>) => {
    if (!condition) return;
    onChange([{ ...condition, ...partial }]);
  };

  const updateReferenceField = (fieldId: string) => {
    const nextField = referenceable.find((item) => item.id === fieldId);
    update({
      field_id: fieldId,
      value: needsConditionValue ? getDefaultConditionValue(nextField) : condition?.value,
    });
  };

  const updateOperator = (operator: ConditionOperator) => {
    update({
      operator,
      value:
        operator === "is_empty" || operator === "is_not_empty"
          ? ""
          : condition?.value || getDefaultConditionValue(referenceField),
    });
  };

  return (
    <div className="border-t border-slate-100 pt-5">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900">{t("title")}</h3>
        {!canUse && (
          <button type="button" onClick={onLockedClick} className="rounded-full outline-none">
            <Badge variant="pro">{tCommon("pro")}</Badge>
          </button>
        )}
      </div>
      <div className="relative">
        <Switch
          label={t("toggle")}
          checked={!!condition}
          onCheckedChange={toggle}
          disabled={!canUse || referenceable.length === 0}
        />
        {!canUse && (
          <button
            type="button"
            onClick={onLockedClick}
            className="absolute inset-0 cursor-pointer"
            aria-label={tCommon("pro")}
          />
        )}
      </div>

      {condition && (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500">{t("ifField")}</label>
            <select
              value={condition.field_id}
              onChange={(e) => updateReferenceField(e.target.value)}
              className="mt-1 h-9 w-full rounded-input border border-border bg-white px-2 text-sm text-gray-900"
            >
              {referenceable.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">{t("operator")}</label>
            <select
              value={condition.operator}
              onChange={(e) => updateOperator(e.target.value as ConditionOperator)}
              className="mt-1 h-9 w-full rounded-input border border-border bg-white px-2 text-sm text-gray-900"
            >
              {CONDITION_OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {t(`operators.${op}`)}
                </option>
              ))}
            </select>
          </div>

          {needsConditionValue && (
            isChoiceField(referenceField) && referenceOptions.length > 0 ? (
              <div>
                <label className="text-xs text-gray-500">{t("value")}</label>
                <select
                  value={condition.value ?? ""}
                  onChange={(e) => update({ value: e.target.value })}
                  className="mt-1 h-9 w-full rounded-input border border-border bg-white px-2 text-sm text-gray-900"
                >
                  {referenceOptions.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Input label={t("value")} value={condition.value ?? ""} onChange={(e) => update({ value: e.target.value })} />
            )
          )}

          <div>
            <label className="text-xs text-gray-500">{t("action")}</label>
            <select
              value={condition.action}
              onChange={(e) => update({ action: e.target.value as ConditionAction })}
              className="mt-1 h-9 w-full rounded-input border border-border bg-white px-2 text-sm text-gray-900"
            >
              <option value="show">{t("show")}</option>
              <option value="hide">{t("hide")}</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizScoringEditor({
  field,
  onChange,
}: {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
}) {
  const t = useTranslations("builder.props.quiz");
  const options = field.options ?? [];
  const selectedAnswers = Array.isArray(field.answer_key) ? field.answer_key : [];
  const scaleMin = field.scaleMin ?? 1;
  const scaleMax = field.scaleMax ?? 5;
  const scaleValues = Array.from({ length: Math.max(scaleMax - scaleMin + 1, 0) }, (_, index) => scaleMin + index);

  const updatePoints = (value: string) => {
    onChange({ points: value === "" ? undefined : Math.max(0, Number(value)) });
  };

  const toggleMultiAnswer = (value: string) => {
    onChange({
      answer_key: selectedAnswers.includes(value)
        ? selectedAnswers.filter((item) => item !== value)
        : [...selectedAnswers, value],
    });
  };

  return (
    <div className="rounded-input border border-primary-100 bg-primary-50/40 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-900">{t("title")}</p>
          <p className="text-xs leading-5 text-primary-700">{t("hint")}</p>
        </div>
        <Input
          type="number"
          min={0}
          value={field.points ?? ""}
          onChange={(event) => updatePoints(event.target.value)}
          className="h-9 w-20 bg-white text-center"
          aria-label={t("points")}
        />
      </div>

      {field.type === "multiple_choice" && options.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">{t("answerKey")}</label>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleMultiAnswer(option.value)}
              className="flex items-center gap-2 rounded-input bg-white px-2 py-2 text-left text-sm text-slate-700 hover:bg-primary-50"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded border border-primary-200">
                {selectedAnswers.includes(option.value) && <span className="h-2 w-2 rounded-sm bg-primary-600" />}
              </span>
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {(field.type === "single_choice" || field.type === "dropdown") && options.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-600">{t("answerKey")}</label>
          <select
            value={typeof field.answer_key === "string" ? field.answer_key : ""}
            onChange={(event) => onChange({ answer_key: event.target.value || null })}
            className="mt-1 h-9 w-full rounded-input border border-border bg-white px-2 text-sm text-slate-900"
          >
            <option value="">{t("noAnswer")}</option>
            {options.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {field.type === "scale" && scaleValues.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-600">{t("answerKey")}</label>
          <select
            value={typeof field.answer_key === "number" ? String(field.answer_key) : ""}
            onChange={(event) =>
              onChange({ answer_key: event.target.value === "" ? null : Number(event.target.value) })
            }
            className="mt-1 h-9 w-full rounded-input border border-border bg-white px-2 text-sm text-slate-900"
          >
            <option value="">{t("noAnswer")}</option>
            {scaleValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      )}

      {(field.type === "short_text" || field.type === "long_text" || field.type === "number") && (
        <Input
          type={field.type === "number" ? "number" : "text"}
          label={t("answerKey")}
          value={field.answer_key === null || field.answer_key === undefined ? "" : String(field.answer_key)}
          onChange={(event) =>
            onChange({
              answer_key:
                event.target.value === ""
                  ? null
                  : field.type === "number"
                    ? Number(event.target.value)
                    : event.target.value,
            })
          }
          className="bg-white"
        />
      )}
    </div>
  );
}

export function BuilderPropsPanelContent({
  canUseConditionalLogic,
  onLockedClick,
  sectionMode = "single",
  onSectionModeChange,
  quizEnabled = false,
}: {
  canUseConditionalLogic: boolean;
  onLockedClick: () => void;
  sectionMode?: FormSettings["section_mode"];
  onSectionModeChange?: (mode: FormSettings["section_mode"]) => void;
  quizEnabled?: boolean;
}) {
  const t = useTranslations();
  const fields = useFormBuilderStore((s) => s.fields);
  const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId);
  const updateField = useFormBuilderStore((s) => s.updateField);

  const field = fields.find((f) => f.id === selectedFieldId);

  return (
    <>
      {!field ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-8 ring-slate-50">
            <MousePointerClick className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-700">{t("builder.noFieldSelected")}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Pengaturan field akan muncul di panel ini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-center gap-2 text-primary-600">
            <SlidersHorizontal className="h-4 w-4" />
            <h2 className="text-xs font-bold uppercase tracking-[0.12em]">{t("builder.props.title")}</h2>
          </div>

          <Input
            label={t("builder.props.label")}
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
          />

          {field.type === "paragraph" ? (
            <Textarea
              label={t("builder.props.content")}
              value={field.content ?? ""}
              onChange={(e) => updateField(field.id, { content: e.target.value })}
              rows={5}
            />
          ) : (
            <Textarea
              label={t("builder.props.description")}
              value={field.description ?? ""}
              onChange={(e) => updateField(field.id, { description: e.target.value })}
            />
          )}

          {field.type === "section" && onSectionModeChange && (
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                {t("builder.props.sectionMode")}
              </label>
              <div className="grid grid-cols-2 rounded-input bg-slate-100 p-1">
                {(["single", "paged"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onSectionModeChange(mode)}
                    className={`h-9 rounded-input text-xs font-semibold transition ${
                      sectionMode === mode
                        ? "bg-white text-primary-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t(`builder.props.sectionModes.${mode}`)}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                {t(`builder.props.sectionModeHints.${sectionMode}`)}
              </p>
            </div>
          )}

          {field.type !== "section" && field.type !== "paragraph" && (
            <Switch
              label={t("builder.props.required")}
              checked={field.required}
              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
            />
          )}

          {quizEnabled && SCORABLE_TYPES.includes(field.type) && (
            <QuizScoringEditor field={field} onChange={(patch) => updateField(field.id, patch)} />
          )}

          {(field.type === "short_text" || field.type === "long_text" || field.type === "number" || field.type === "email" || field.type === "phone") && (
            <Input
              label={t("builder.props.placeholder")}
              value={field.placeholder ?? ""}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            />
          )}

          {(field.type === "short_text" || field.type === "long_text") && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                label={t("builder.props.minLength")}
                value={field.validation?.min_length ?? ""}
                onChange={(e) =>
                  updateField(field.id, {
                    validation: { ...field.validation, min_length: toNumberOrUndefined(e.target.value) },
                  })
                }
              />
              <Input
                type="number"
                label={t("builder.props.maxLength")}
                value={field.validation?.max_length ?? ""}
                onChange={(e) =>
                  updateField(field.id, {
                    validation: { ...field.validation, max_length: toNumberOrUndefined(e.target.value) },
                  })
                }
              />
            </div>
          )}

          {field.type === "number" && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                label={t("builder.props.minValue")}
                value={field.validation?.min_value ?? ""}
                onChange={(e) =>
                  updateField(field.id, {
                    validation: { ...field.validation, min_value: toNumberOrUndefined(e.target.value) },
                  })
                }
              />
              <Input
                type="number"
                label={t("builder.props.maxValue")}
                value={field.validation?.max_value ?? ""}
                onChange={(e) =>
                  updateField(field.id, {
                    validation: { ...field.validation, max_value: toNumberOrUndefined(e.target.value) },
                  })
                }
              />
            </div>
          )}

          {CHOICE_TYPES.includes(field.type) && (
            <OptionsEditor field={field} onChange={(options) => updateField(field.id, { options })} />
          )}

          {field.type === "scale" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  label={t("builder.props.scaleMin")}
                  value={field.scaleMin ?? 1}
                  onChange={(e) => updateField(field.id, { scaleMin: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  label={t("builder.props.scaleMax")}
                  value={field.scaleMax ?? 5}
                  onChange={(e) => updateField(field.id, { scaleMax: Number(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={t("builder.props.scaleMinLabel")}
                  value={field.scaleMinLabel ?? ""}
                  onChange={(e) => updateField(field.id, { scaleMinLabel: e.target.value })}
                />
                <Input
                  label={t("builder.props.scaleMaxLabel")}
                  value={field.scaleMaxLabel ?? ""}
                  onChange={(e) => updateField(field.id, { scaleMaxLabel: e.target.value })}
                />
              </div>
            </>
          )}

          <ConditionsEditor
            field={field}
            fields={fields}
            onChange={(conditions) => updateField(field.id, { conditions })}
            canUse={canUseConditionalLogic}
            onLockedClick={onLockedClick}
          />
        </div>
      )}
    </>
  );
}

export function BuilderPropsPanel({
  canUseConditionalLogic,
  onLockedClick,
  sectionMode,
  onSectionModeChange,
  quizEnabled,
}: {
  canUseConditionalLogic: boolean;
  onLockedClick: () => void;
  sectionMode?: FormSettings["section_mode"];
  onSectionModeChange?: (mode: FormSettings["section_mode"]) => void;
  quizEnabled?: boolean;
}) {
  return (
    <aside className="hidden w-[320px] shrink-0 overflow-y-auto border-l border-border bg-white xl:block">
      <BuilderPropsPanelContent
        canUseConditionalLogic={canUseConditionalLogic}
        onLockedClick={onLockedClick}
        sectionMode={sectionMode}
        onSectionModeChange={onSectionModeChange}
        quizEnabled={quizEnabled}
      />
    </aside>
  );
}
