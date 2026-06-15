import { create } from "zustand";
import type { GenerateProgress } from "../../../shared/types";

export type DataSource = "kaemform" | "excel" | "manual";

interface GenerateState {
  step: 1 | 2 | 3 | 4 | 5;
  templateId: string | null;
  dataSource: DataSource;
  sourceId: string | null;
  records: Record<string, unknown>[];
  mapping: Record<string, string>;
  outputFormats: Array<"docx" | "pdf">;
  isGenerating: boolean;
  progress: GenerateProgress;
  result: { success: number; failed: number; outputPath: string; warnings: string[] } | null;
  set: (values: Partial<GenerateState>) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
}

const initial = {
  step: 1 as const,
  templateId: null,
  dataSource: "kaemform" as const,
  sourceId: null,
  records: [] as Record<string, unknown>[],
  mapping: {} as Record<string, string>,
  outputFormats: ["docx"] as Array<"docx" | "pdf">,
  isGenerating: false,
  progress: {
    current: 0,
    total: 0,
    filename: "",
    status: "preparing" as const,
  },
  result: null,
};

export const useGenerateStore = create<GenerateState>((set, get) => ({
  ...initial,
  set: (values) => set(values),
  next: () =>
    set({ step: Math.min(get().step + 1, 5) as GenerateState["step"] }),
  back: () =>
    set({ step: Math.max(get().step - 1, 1) as GenerateState["step"] }),
  reset: () => set(initial),
}));
