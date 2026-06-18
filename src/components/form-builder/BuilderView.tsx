"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Palette, Plus, Shuffle, SlidersHorizontal, Trophy } from "lucide-react";
import { FIELD_TYPES, type FieldType, type Form, type FormSettings } from "@kaemform/shared";
import { Button, Input, Modal, Switch } from "@/components/ui";
import { useToast } from "@/stores/toastStore";
import { useFormBuilderStore } from "@/stores/formBuilderStore";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { QRCodeModal } from "@/components/shared/QRCodeModal";
import { BuilderTopbar } from "./BuilderTopbar";
import { BuilderPalette, BuilderPaletteContent } from "./BuilderPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { BuilderPropsPanel, BuilderPropsPanelContent } from "./BuilderPropsPanel";

const ICONS = LucideIcons as unknown as Record<string, LucideIcon>;
const DEFAULT_PRIMARY_COLOR = "#2563EB";
const THEME_SWATCHES = ["#2563EB", "#059669", "#7C3AED", "#DC2626", "#EA580C", "#475569"];

function normalizeFormSettings(settings: FormSettings): FormSettings {
  return {
    ...settings,
    section_mode: settings.section_mode ?? "single",
    theme: {
      primary_color: settings.theme?.primary_color ?? DEFAULT_PRIMARY_COLOR,
      font: settings.theme?.font ?? "default",
    },
    quiz_enabled: settings.quiz_enabled ?? false,
    randomize_questions: settings.randomize_questions ?? false,
    randomize_options: settings.randomize_options ?? false,
  };
}

function BuilderFormSettingsModal({
  open,
  onOpenChange,
  settings,
  onChange,
  totalPoints,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: FormSettings;
  onChange: (patch: Partial<FormSettings>) => void;
  totalPoints: number;
}) {
  const t = useTranslations("builder.formSettings");

  const updateColor = (color: string) => {
    onChange({ theme: { ...settings.theme, primary_color: color } });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      className="max-w-lg"
      footer={
        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
          {t("done")}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Palette className="h-4 w-4 text-primary-600" />
            {t("themeTitle")}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {THEME_SWATCHES.map((color) => {
              const selected = settings.theme.primary_color.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateColor(color)}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    selected ? "border-slate-900 ring-4 ring-slate-100" : "border-white shadow-sm"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                  title={color}
                />
              );
            })}
            <Input
              type="color"
              value={settings.theme.primary_color}
              onChange={(event) => updateColor(event.target.value)}
              className="h-9 w-14 cursor-pointer bg-white p-1"
              aria-label={t("customColor")}
            />
          </div>
        </div>

        <div className="rounded-input border border-slate-100 bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Trophy className="h-4 w-4 text-primary-600" />
              {t("quizTitle")}
            </div>
            {settings.quiz_enabled && (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                {t("totalPoints", { points: totalPoints })}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Switch
              label={t("quizEnabled")}
              checked={settings.quiz_enabled}
              onCheckedChange={(checked) => onChange({ quiz_enabled: checked })}
            />
            <Switch
              label={t("randomQuestions")}
              checked={settings.randomize_questions}
              onCheckedChange={(checked) => onChange({ randomize_questions: checked })}
            />
            <Switch
              label={t("randomOptions")}
              checked={settings.randomize_options}
              onCheckedChange={(checked) => onChange({ randomize_options: checked })}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-input border border-primary-100 bg-primary-50 p-3 text-xs leading-5 text-primary-800">
          <Shuffle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t("randomHint")}</p>
        </div>
      </div>
    </Modal>
  );
}

export function BuilderView({
  form,
  workspaceSlug,
  canUseConditionalLogic,
  canUseSignature,
}: {
  form: Form;
  workspaceSlug: string;
  canUseConditionalLogic: boolean;
  canUseSignature: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();

  const fields = useFormBuilderStore((s) => s.fields);
  const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId);
  const isDirty = useFormBuilderStore((s) => s.isDirty);
  const isSaving = useFormBuilderStore((s) => s.isSaving);
  const init = useFormBuilderStore((s) => s.init);
  const addField = useFormBuilderStore((s) => s.addField);
  const moveField = useFormBuilderStore((s) => s.moveField);
  const setSaving = useFormBuilderStore((s) => s.setSaving);
  const markSaved = useFormBuilderStore((s) => s.markSaved);
  const undo = useFormBuilderStore((s) => s.undo);
  const redo = useFormBuilderStore((s) => s.redo);

  const [status, setStatus] = useState(form.status);
  const [title, setTitle] = useState(form.title);
  const [formSettings, setFormSettings] = useState<FormSettings>(normalizeFormSettings(form.settings));
  const [previewMode, setPreviewMode] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [activeDrag, setActiveDrag] = useState<FieldType | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [formSettingsOpen, setFormSettingsOpen] = useState(false);
  const [paletteSheetOpen, setPaletteSheetOpen] = useState(false);
  const [propsSheetOpen, setPropsSheetOpen] = useState(false);

  useEffect(() => {
    init(form.id, form.schema);
  }, [form.id, form.schema, init]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  useEffect(() => {
    if (!isDirty) return;
    setSaving(true);
    const timeout = setTimeout(() => {
      fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema: fields }),
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          markSaved();
        })
        .catch(() => {
          setSaving(false);
          toast({ title: t("builder.saveError"), variant: "error" });
        });
    }, 2000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, isDirty]);

  const updateFormSettings = (patch: Partial<FormSettings>) => {
    setFormSettings((prev) => {
      const next = { ...prev, ...patch };
      void fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: next }),
      }).catch(() => {
        toast({ title: t("builder.saveError"), variant: "error" });
      });
      return next;
    });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.source === "palette") {
      setActiveDrag(data.fieldType as FieldType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    if (activeData?.source === "palette") {
      const fieldType = activeData.fieldType as FieldType;
      const overIndex = fields.findIndex((f) => f.id === over.id);
      addField(fieldType, overIndex === -1 ? fields.length : overIndex);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) moveField(oldIndex, newIndex);
    }
  };

  const handleTitleBlur = async (newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === form.title) return;
    await fetch(`/api/forms/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
  };

  const handlePublish = async () => {
    const res = await fetch(`/api/forms/${form.id}/publish`, { method: "POST" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast({
        title: json.error === "form_empty" ? t("form.publishRequiresField") : t("common.error"),
        variant: "error",
      });
      return;
    }
    setStatus("published");
    setPublishOpen(false);
    router.refresh();
  };

  const handleClose = async () => {
    const res = await fetch(`/api/forms/${form.id}/close`, { method: "POST" });
    if (!res.ok) {
      toast({ title: t("common.error"), variant: "error" });
      return;
    }
    setStatus("closed");
    setCloseOpen(false);
    router.refresh();
  };

  const handleReopen = async () => {
    const res = await fetch(`/api/forms/${form.id}/reopen`, { method: "POST" });
    if (!res.ok) {
      toast({ title: t("common.error"), variant: "error" });
      return;
    }
    setStatus("published");
    setReopenOpen(false);
    router.refresh();
  };

  const activeIconName = activeDrag ? FIELD_TYPES.find((f) => f.type === activeDrag)?.icon : null;
  const ActiveIcon = activeIconName ? ICONS[activeIconName] ?? LucideIcons.Square : null;

  const formUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${form.slug}`;
  const totalPoints = fields.reduce((sum, field) => sum + (field.points ?? 0), 0);

  return (
    <div className="flex h-[calc(100dvh-59px)] min-h-[620px] flex-col bg-slate-50">
      <BuilderTopbar
        workspaceSlug={workspaceSlug}
        status={status}
        title={title}
        onTitleChange={setTitle}
        onTitleBlur={handleTitleBlur}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode((p) => !p)}
        onPublish={() => setPublishOpen(true)}
        onClose={() => setCloseOpen(true)}
        onReopen={() => setReopenOpen(true)}
        onShowQrCode={() => setQrOpen(true)}
        onOpenFormSettings={() => setFormSettingsOpen(true)}
        formUrl={formUrl}
        isDirty={isDirty}
        isSaving={isSaving}
      />

      {previewMode ? (
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <FormRenderer form={{ ...form, title, schema: fields, settings: formSettings }} preview />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex flex-1 overflow-hidden">
            <BuilderPalette canUseSignature={canUseSignature} onLockedClick={() => setUpgradeOpen(true)} />
            <BuilderCanvas />
            <BuilderPropsPanel
              canUseConditionalLogic={canUseConditionalLogic}
              onLockedClick={() => setUpgradeOpen(true)}
              sectionMode={formSettings.section_mode ?? "single"}
              onSectionModeChange={(sectionMode) => updateFormSettings({ section_mode: sectionMode })}
              quizEnabled={formSettings.quiz_enabled}
            />
          </div>
          <DragOverlay>
            {activeDrag && ActiveIcon ? (
              <div className="flex items-center gap-2 rounded-input border border-primary-300 bg-white px-3 py-2 text-sm shadow-card-hover">
                <ActiveIcon className="h-4 w-4 text-primary-600" />
                {t(`fieldTypes.${activeDrag}`)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {!previewMode && (
        <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2">
          {selectedFieldId && (
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="h-12 w-12 rounded-full p-0 shadow-card-hover xl:hidden"
              aria-label={t("builder.props.title")}
              onClick={() => setPropsSheetOpen(true)}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          )}
          <Button
            type="button"
            size="lg"
            className="h-12 w-12 rounded-full p-0 shadow-card-hover lg:hidden"
            aria-label={t("builder.palette.title")}
            onClick={() => setPaletteSheetOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      )}

      <Modal open={paletteSheetOpen} onOpenChange={setPaletteSheetOpen}>
        <BuilderPaletteContent
          canUseSignature={canUseSignature}
          onLockedClick={() => {
            setPaletteSheetOpen(false);
            setUpgradeOpen(true);
          }}
          onAdd={() => setPaletteSheetOpen(false)}
        />
      </Modal>

      <Modal open={propsSheetOpen} onOpenChange={setPropsSheetOpen}>
        <BuilderPropsPanelContent
          canUseConditionalLogic={canUseConditionalLogic}
          onLockedClick={() => {
            setPropsSheetOpen(false);
            setUpgradeOpen(true);
          }}
          sectionMode={formSettings.section_mode ?? "single"}
          onSectionModeChange={(sectionMode) => updateFormSettings({ section_mode: sectionMode })}
          quizEnabled={formSettings.quiz_enabled}
        />
      </Modal>

      <BuilderFormSettingsModal
        open={formSettingsOpen}
        onOpenChange={setFormSettingsOpen}
        settings={formSettings}
        onChange={updateFormSettings}
        totalPoints={totalPoints}
      />

      <Modal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title={t("form.publishConfirmTitle")}
        description={fields.length === 0 ? t("form.publishRequiresField") : t("form.publishConfirmDescription")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPublishOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handlePublish} disabled={fields.length === 0}>
              {t("builder.publish")}
            </Button>
          </>
        }
      />

      <Modal
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title={t("form.closeConfirmTitle")}
        description={t("form.closeConfirmDescription")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCloseOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={handleClose}>
              {t("builder.close")}
            </Button>
          </>
        }
      />

      <Modal
        open={reopenOpen}
        onOpenChange={setReopenOpen}
        title={t("form.reopenConfirmTitle")}
        description={t("form.reopenConfirmDescription")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReopenOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleReopen}>
              {t("builder.reopen")}
            </Button>
          </>
        }
      />

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <QRCodeModal open={qrOpen} onOpenChange={setQrOpen} url={formUrl} />
    </div>
  );
}
