"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import type { FormField } from "@kaemform/shared";
import { useFormBuilderStore } from "@/stores/formBuilderStore";
import { FieldPreview, NO_LABEL_TYPES } from "./fields/FieldPreview";
import { cn } from "@/lib/utils";

export function CanvasFieldCard({ field }: { field: FormField }) {
  const fields = useFormBuilderStore((s) => s.fields);
  const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId);
  const selectField = useFormBuilderStore((s) => s.selectField);
  const duplicateField = useFormBuilderStore((s) => s.duplicateField);
  const removeField = useFormBuilderStore((s) => s.removeField);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const selected = selectedFieldId === field.id;
  const isSection = field.type === "section";
  const sectionFields = fields.filter((item) => item.type === "section");
  const sectionIndex = sectionFields.findIndex((item) => item.id === field.id);
  const sectionMeta =
    sectionIndex === -1 ? undefined : { index: sectionIndex + 1, total: sectionFields.length };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => selectField(field.id)}
      className={cn(
        "group relative cursor-pointer rounded-card border border-l-[3px] bg-white p-4 shadow-card transition-all duration-150 hover:-translate-y-px hover:shadow-card-hover sm:px-5",
        isSection && "overflow-hidden border-primary-100 bg-white",
        selected
          ? "border-primary-200 border-l-primary-500 bg-primary-50/20"
          : "border-border border-l-transparent",
        isDragging && "opacity-50"
      )}
    >
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Drag"
          title="Drag"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            duplicateField(field.id);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-slate-50 text-slate-400 hover:bg-primary-50 hover:text-primary-700"
          aria-label="Duplicate"
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeField(field.id);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-error"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {!NO_LABEL_TYPES.includes(field.type) && (
        <div className="mb-2 pr-16">
          <span className="text-sm font-semibold text-slate-900">
            {field.label}
            {field.required && <span className="text-error"> *</span>}
            {!!field.points && (
              <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary-700">
                {field.points} poin
              </span>
            )}
          </span>
          {field.description && <p className="mt-1 text-xs leading-5 text-slate-500">{field.description}</p>}
        </div>
      )}

      <FieldPreview field={field} sectionMeta={sectionMeta} />
    </div>
  );
}
