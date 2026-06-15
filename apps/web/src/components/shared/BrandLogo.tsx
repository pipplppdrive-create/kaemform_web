import { cn } from "@/lib/utils";

export function BrandLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-[11px] border border-primary-200 bg-primary-600 shadow-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kaemform-logo.png"
          alt=""
          className="h-full w-full scale-[1.18] object-cover"
        />
      </span>
      {!compact && (
        <span className="text-[17px] font-bold tracking-tight text-primary-800">
          KaemForm
        </span>
      )}
    </div>
  );
}
