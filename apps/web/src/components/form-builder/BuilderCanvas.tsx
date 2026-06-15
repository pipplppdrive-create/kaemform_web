"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useFormBuilderStore } from "@/stores/formBuilderStore";
import { CanvasFieldCard } from "./CanvasFieldCard";
import { Button } from "@/components/ui";

export function BuilderCanvas() {
  const t = useTranslations("builder.canvas");
  const fields = useFormBuilderStore((s) => s.fields);
  const addField = useFormBuilderStore((s) => s.addField);
  const { setNodeRef } = useDroppable({ id: "canvas" });

  return (
    <div ref={setNodeRef} className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-[680px] flex-col gap-3">
        {fields.length === 0 ? (
          <div className="rounded-card border-2 border-dashed border-primary-200 bg-white/80 p-12 text-center shadow-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <Plus className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">{t("empty")}</p>
          </div>
        ) : (
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((field) => (
              <CanvasFieldCard key={field.id} field={field} />
            ))}
          </SortableContext>
        )}

        <Button
          type="button"
          variant="ghost"
          className="border-2 border-dashed border-slate-200 bg-transparent text-slate-500 shadow-none hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          onClick={() => addField("short_text")}
        >
          <Plus className="h-4 w-4" />
          {t("addField")}
        </Button>
      </div>
    </div>
  );
}
