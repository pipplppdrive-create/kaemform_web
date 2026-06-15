import { cn } from "@/lib/utils";
import type { FormStatus } from "@kaemform/shared";

export type BadgeVariant = FormStatus | "default" | "pro" | "trial" | "free";

const variantClasses: Record<BadgeVariant, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-red-50 text-red-700 ring-red-200",
  archived: "bg-slate-100 text-slate-500 ring-slate-200",
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  pro: "bg-primary-600 text-white ring-primary-600",
  trial: "bg-amber-50 text-amber-700 ring-amber-200",
  free: "bg-slate-100 text-slate-600 ring-slate-200",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
