import { cn } from "@/lib/utils";

export function KaemnurAttribution({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-label={compact ? "App by Kaemnur" : undefined}
      className={cn("inline-flex items-center gap-2 rounded-full text-slate-700", className)}
    >
      <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-950 ring-1 ring-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kaemnur-logo.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </span>
      {!compact && (
        <span className="text-xs font-semibold tracking-tight">
          App by <span className="text-slate-950">Kaemnur</span>
        </span>
      )}
    </div>
  );
}
