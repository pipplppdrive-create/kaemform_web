"use client";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { FIELD_TYPES, FIELD_TYPE_GROUPS, type FieldType } from "@kaemform/shared";
import { useFormBuilderStore } from "@/stores/formBuilderStore";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const ICONS = LucideIcons as unknown as Record<string, LucideIcon>;

function PaletteItem({
  type,
  iconName,
  locked,
  onLockedClick,
  onAdd,
}: {
  type: FieldType;
  iconName: string;
  locked: boolean;
  onLockedClick: () => void;
  onAdd?: () => void;
}) {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const addField = useFormBuilderStore((s) => s.addField);
  const Icon = ICONS[iconName] ?? LucideIcons.Square;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { source: "palette", fieldType: type },
    disabled: locked,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...(locked ? {} : { ...listeners, ...attributes })}
      onClick={() => {
        if (locked) {
          onLockedClick();
          return;
        }
        addField(type);
        onAdd?.();
      }}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-input px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-800",
        isDragging && "opacity-50"
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-slate-50 text-primary-500 transition-colors group-hover:bg-white">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1">{t(`fieldTypes.${type}`)}</span>
      {locked && <Badge variant="pro">{tCommon("pro")}</Badge>}
    </button>
  );
}

export function BuilderPaletteContent({
  canUseSignature,
  onLockedClick,
  onAdd,
}: {
  canUseSignature: boolean;
  onLockedClick: () => void;
  onAdd?: () => void;
}) {
  const t = useTranslations("builder.palette");

  return (
    <>
      <h2 className="text-sm font-bold text-slate-900">{t("title")}</h2>
      <p className="mt-1 text-xs leading-5 text-slate-400">Klik atau tarik field ke canvas.</p>
      <div className="mt-5 flex flex-col gap-5">
        {FIELD_TYPE_GROUPS.map((group) => (
          <div key={group.key}>
            <h3 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {t(`groups.${group.key}`)}
            </h3>
            <div className="flex flex-col gap-1">
              {FIELD_TYPES.filter((f) => f.group === group.key).map((f) => (
                <PaletteItem
                  key={f.type}
                  type={f.type}
                  iconName={f.icon}
                  locked={f.type === "signature" && !canUseSignature}
                  onLockedClick={onLockedClick}
                  onAdd={onAdd}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function BuilderPalette({
  canUseSignature,
  onLockedClick,
}: {
  canUseSignature: boolean;
  onLockedClick: () => void;
}) {
  return (
    <aside className="hidden w-[220px] shrink-0 overflow-y-auto border-r border-border bg-white p-4 lg:block">
      <BuilderPaletteContent canUseSignature={canUseSignature} onLockedClick={onLockedClick} />
    </aside>
  );
}
