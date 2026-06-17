import { cn } from "@/lib/utils";
import { strokeToPath } from "@/lib/signature-path";
import type { SignatureData } from "@kaemform/shared";

export interface SignatureRendererProps {
  data: SignatureData;
  className?: string;
}

export function SignatureRenderer({ data, className }: SignatureRendererProps) {
  return (
    <svg
      viewBox={`0 0 ${data.canvas.width} ${data.canvas.height}`}
      className={cn("h-auto w-full rounded-input border border-border bg-white", className)}
      role="img"
      aria-label="Signature"
    >
      {data.strokes.map((stroke, i) => (
        <path
          key={i}
          d={strokeToPath(stroke)}
          fill="none"
          stroke={stroke.color}
          strokeWidth={stroke.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
