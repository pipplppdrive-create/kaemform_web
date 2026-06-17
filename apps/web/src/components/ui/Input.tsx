"use client";

import { forwardRef, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, description, icon, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error || undefined}
            aria-describedby={cn(descId, errorId) || undefined}
            className={cn(
              "h-11 w-full rounded-input border border-border bg-slate-50 px-3.5 text-sm text-slate-900 shadow-sm transition-all duration-150",
              "placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100",
              "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
              icon && "pl-10",
              error && "border-error focus:border-error focus:ring-red-100",
              className
            )}
            {...props}
          />
        </div>
        {description && !error && (
          <p id={descId} className="text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-medium text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, description, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={cn(descId, errorId) || undefined}
          className={cn(
            "min-h-[96px] w-full resize-y rounded-input border border-border bg-slate-50 px-3.5 py-3 text-sm text-slate-900 shadow-sm transition-all duration-150",
            "placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
            error && "border-error focus:border-error focus:ring-red-100",
            className
          )}
          {...props}
        />
        {description && !error && (
          <p id={descId} className="text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-medium text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
