import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "../lib/utils";

export function DragDropZone({
  accept,
  label,
  hint,
  onFile,
}: {
  accept: string;
  label: string;
  hint?: string;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <button
      type="button"
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-card border-2 border-dashed p-8 text-center transition-all",
        dragging
          ? "border-kaem-400 bg-kaem-50 text-kaem-700"
          : "border-slate-200 bg-slate-50/60 text-slate-500 hover:border-kaem-300 hover:bg-kaem-50/50"
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) onFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.currentTarget.value = "";
        }}
      />
      <UploadCloud className="mb-3 h-7 w-7 text-kaem-500" />
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-1 text-xs text-slate-400">{hint ?? "atau klik untuk memilih file"}</span>
    </button>
  );
}
