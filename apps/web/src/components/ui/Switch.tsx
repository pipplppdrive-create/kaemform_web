"use client";

import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export interface SwitchProps extends RadixSwitch.SwitchProps {
  label?: string;
}

export function Switch({ className, label, id, ...props }: SwitchProps) {
  const switchEl = (
    <RadixSwitch.Root
      id={id}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full bg-slate-300 outline-none transition-colors",
        "data-[state=checked]:bg-primary-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
    </RadixSwitch.Root>
  );

  if (!label) return switchEl;

  return (
    <label htmlFor={id} className="flex items-center justify-between gap-3 text-sm text-slate-700">
      <span>{label}</span>
      {switchEl}
    </label>
  );
}
