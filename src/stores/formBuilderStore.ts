import { create } from "zustand";
import { nanoid } from "nanoid";
import { arrayMove } from "@dnd-kit/sortable";
import { getFieldTypeDef, type FieldType, type FormField } from "@kaemform/shared";

const MAX_HISTORY = 50;

interface FormBuilderState {
  formId: string | null;
  fields: FormField[];
  selectedFieldId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  history: FormField[][];
  historyIndex: number;

  init: (formId: string, fields: FormField[]) => void;
  setFields: (fields: FormField[]) => void;
  addField: (type: FieldType, index?: number) => void;
  removeField: (id: string) => void;
  updateField: (id: string, partial: Partial<FormField>) => void;
  moveField: (from: number, to: number) => void;
  selectField: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  setSaving: (saving: boolean) => void;
  markSaved: () => void;
}

const reorder = (fields: FormField[]): FormField[] =>
  fields.map((field, index) => ({ ...field, order: index }));

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  formId: null,
  fields: [],
  selectedFieldId: null,
  isDirty: false,
  isSaving: false,
  history: [[]],
  historyIndex: 0,

  init: (formId, fields) =>
    set({
      formId,
      fields,
      selectedFieldId: null,
      isDirty: false,
      isSaving: false,
      history: [fields],
      historyIndex: 0,
    }),

  setFields: (fields) =>
    set((state) => {
      const history = [...state.history.slice(0, state.historyIndex + 1), fields];
      if (history.length > MAX_HISTORY) history.shift();
      return {
        fields,
        history,
        historyIndex: history.length - 1,
        isDirty: true,
      };
    }),

  addField: (type, index) => {
    const { fields, setFields } = get();
    const def = getFieldTypeDef(type);
    const newField = def.defaults(nanoid(8), fields.length);
    const insertAt = index ?? fields.length;
    const next = [...fields];
    next.splice(insertAt, 0, newField);
    setFields(reorder(next));
    set({ selectedFieldId: newField.id });
  },

  removeField: (id) => {
    const { fields, setFields, selectedFieldId } = get();
    setFields(reorder(fields.filter((f) => f.id !== id)));
    if (selectedFieldId === id) set({ selectedFieldId: null });
  },

  updateField: (id, partial) => {
    const { fields, setFields } = get();
    setFields(fields.map((f) => (f.id === id ? { ...f, ...partial } : f)));
  },

  moveField: (from, to) => {
    const { fields, setFields } = get();
    setFields(reorder(arrayMove(fields, from, to)));
  },

  selectField: (id) => set({ selectedFieldId: id }),

  undo: () => {
    const { history, historyIndex } = get();
    const targetIndex = historyIndex - 1;
    const target = history[targetIndex];
    if (targetIndex < 0 || !target) return;
    set({ fields: target, historyIndex: targetIndex, isDirty: true });
  },

  redo: () => {
    const { history, historyIndex } = get();
    const targetIndex = historyIndex + 1;
    const target = history[targetIndex];
    if (targetIndex >= history.length || !target) return;
    set({ fields: target, historyIndex: targetIndex, isDirty: true });
  },

  setSaving: (saving) => set({ isSaving: saving }),

  markSaved: () => set({ isDirty: false, isSaving: false }),
}));
