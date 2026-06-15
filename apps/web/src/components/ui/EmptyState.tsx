import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-primary-200 bg-gradient-to-b from-white to-primary-50/40 p-10 text-center shadow-card",
        className
      )}
    >
      {Icon && (
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 ring-8 ring-primary-50">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-6 text-slate-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
