"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white shadow-button hover:-translate-y-px hover:bg-primary-700 hover:shadow-lg disabled:translate-y-0 disabled:bg-primary-300 disabled:shadow-none",
  secondary:
    "border border-primary-200 bg-white text-primary-700 shadow-sm hover:-translate-y-px hover:border-primary-300 hover:bg-primary-50 disabled:translate-y-0 disabled:border-border disabled:text-gray-400 disabled:shadow-none",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-400",
  danger:
    "bg-error text-white shadow-sm hover:-translate-y-px hover:bg-red-600 hover:shadow-md disabled:translate-y-0 disabled:bg-red-300 disabled:shadow-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-input font-semibold transition-all duration-150 ease-out",
          "disabled:cursor-not-allowed disabled:opacity-70",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
