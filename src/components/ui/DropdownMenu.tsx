"use client";

import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

export function DropdownMenuContent({
  className,
  align = "end",
  ...props
}: RadixDropdownMenu.DropdownMenuContentProps) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        align={align}
        sideOffset={8}
        className={cn(
          "z-50 min-w-[180px] rounded-card border border-border bg-white p-1.5 shadow-card-hover",
          "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  variant,
  ...props
}: RadixDropdownMenu.DropdownMenuItemProps & { variant?: "default" | "danger" }) {
  return (
    <RadixDropdownMenu.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-input px-2.5 py-2 text-[13px] font-medium outline-none",
        "data-[highlighted]:bg-primary-50 data-[highlighted]:text-primary-800",
        variant === "danger" ? "text-error" : "text-gray-700",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: RadixDropdownMenu.DropdownMenuSeparatorProps) {
  return (
    <RadixDropdownMenu.Separator
      className={cn("my-1.5 h-px bg-slate-100", className)}
      {...props}
    />
  );
}
