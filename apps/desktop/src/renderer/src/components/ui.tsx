import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "../lib/utils";

export function Card({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn("rounded-card border border-slate-200 bg-white shadow-card", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-kaem-600 text-white shadow-button hover:-translate-y-px hover:bg-kaem-700 disabled:bg-kaem-300",
      secondary:
        "border border-kaem-200 bg-white text-kaem-700 shadow-sm hover:-translate-y-px hover:bg-kaem-50",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      danger: "bg-red-500 text-white hover:bg-red-600",
    };
    const sizes = {
      sm: "h-9 px-3 text-[13px]",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-input font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ className, label, ...props }, ref) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    {label && <span className="text-[13px] font-semibold text-slate-700">{label}</span>}
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-input border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-kaem-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-kaem-100",
        className
      )}
      {...props}
    />
  </label>
));
Input.displayName = "Input";

export function Select({
  className,
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      {label && <span className="text-[13px] font-semibold text-slate-700">{label}</span>}
      <select
        className={cn(
          "h-11 rounded-input border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 shadow-sm focus:border-kaem-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-kaem-100",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "brand";
}) {
  const styles = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
    brand: "bg-kaem-50 text-kaem-700",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold", styles[variant])}>
      {children}
    </span>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-6 backdrop-blur-sm">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-auto shadow-form">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">{title}</h2>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </Card>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div>
        {eyebrow && <p className="text-sm font-semibold text-kaem-600">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-kaem-200 bg-gradient-to-b from-white to-kaem-50/50 p-10 text-center shadow-card">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-kaem-100 text-kaem-700 ring-8 ring-kaem-50">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-kaem-400 to-kaem-600 transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
